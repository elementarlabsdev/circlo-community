import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PasswordVerificationDto } from '@/identity/application/dtos/password-verification.dto';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { resetPasswordEmail } from '@/identity/application/templates/reset-password.email';
import * as crypto from 'crypto';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';

@Controller('identity/password-verification')
export class PasswordVerificationController {
  constructor(
    private _settingsService: SettingsService,
    private _prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  @Get(':hash')
  async index(@Param('hash') hash: string) {
    const passwordReset = await this._prisma.passwordReset.findUniqueOrThrow({
      where: { hash, verified: false },
      include: {
        user: true,
      },
    });
    return {
      email: passwordReset.user.email,
    };
  }

  @Post(':hash')
  async check(
    @Param('hash') hash: string,
    @Body() passwordVerificationDto: PasswordVerificationDto,
  ) {
    let valid = false;
    const passwordReset = await this._prisma.passwordReset.findUniqueOrThrow({
      where: {
        hash,
        verified: false,
      },
    });

    if (passwordReset.code === +passwordVerificationDto.code) {
      valid = true;
      await this._prisma.passwordReset.update({
        where: {
          id: passwordReset.id,
        },
        data: {
          verified: true,
        },
      });
    }

    return {
      valid,
    };
  }

  @Post(':hash/resend')
  async resend(@Param('hash') hash: string) {
    const passwordReset = await this._prisma.passwordReset.findUniqueOrThrow({
      where: { hash, verified: false },
      include: { user: true },
    });

    const now = new Date();

    // Если пользователь временно заблокирован для ресенда
    if (passwordReset.blockedUntil && passwordReset.blockedUntil > now) {
      const retryAt = passwordReset.blockedUntil.toISOString();
      throw new HttpException(
        {
          message: 'Resend temporarily blocked',
          reason: 'blocked',
          retryAt,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Интервал между отправками (минуты) — используем те же настройки, что и для email verification
    const intervalMinutes = await this._settingsService.findValueByName(
      'emailVerificationIntervalBetweenSendsTime',
    );

    const lastSentAt =
      passwordReset.codeSentLastTimeAt ?? passwordReset.createdAt;
    const nextAllowed = new Date(
      lastSentAt.getTime() + Number(intervalMinutes) * 60 * 1000,
    );

    if (nextAllowed > now) {
      throw new HttpException(
        {
          message: 'Too early to resend',
          reason: 'cooldown',
          retryAt: nextAllowed.toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Проверяем лимит отправок
    const sentLimit = await this._settingsService.findValueByName(
      'emailVerificationSentCount',
    );

    if ((passwordReset.condeSentCount ?? 1) >= sentLimit) {
      const blockTime = await this._settingsService.findValueByName(
        'emailVerificationBlockTime',
      );
      const blockedUntil = new Date(
        now.getTime() + Number(blockTime) * 60 * 1000,
      );
      await this._prisma.passwordReset.update({
        where: { id: passwordReset.id },
        data: { blockedUntil },
      });
      throw new HttpException(
        {
          message: 'Resend limit reached, temporarily blocked',
          reason: 'limit',
          retryAt: blockedUntil.toISOString(),
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Генерируем новый код и хэш
    const newHash = crypto.randomUUID().toString();
    const newCode = Math.floor(100000 + Math.random() * 900000);

    // Обновляем запись (оставляем одну активную запись сброса пароля)
    await this._prisma.passwordReset.update({
      where: { id: passwordReset.id },
      data: {
        code: newCode,
        hash: newHash,
        createdAt: new Date(),
        codeSentLastTimeAt: now,
        condeSentCount: (passwordReset.condeSentCount ?? 1) + 1,
        blockedUntil: null,
      },
    });

    const lang = this.configService.get('LOCALE');
    const communityName = await this._settingsService.findValueByName(
      'siteTitle',
      'Circlo',
    );
    const logoUrl = await this._settingsService.findValueByName('siteLogoUrl');
    this.eventBus.publish(
      new EmailSendEvent(
        passwordReset.user.email,
        await resetPasswordEmail(passwordReset.user.name, newCode, communityName, logoUrl, {
          subject: await this.i18n.t('common.emails.reset_password.subject', {
            lang,
          }),
          hello: await this.i18n.t('common.emails.reset_password.hello', {
            args: { name: passwordReset.user.name },
            lang,
          }),
          text: await this.i18n.t('common.emails.reset_password.text', {
            lang,
          }),
          footer: await this.i18n.t('common.emails.reset_password.footer', {
            lang,
          }),
          footerText: await this.i18n.t('common.emails.all_rights_reserved', {
            lang,
          }),
        }),
      ),
    );

    return { hash: newHash };
  }
}
