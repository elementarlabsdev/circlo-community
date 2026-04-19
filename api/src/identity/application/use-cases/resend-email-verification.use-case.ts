import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ResendEmailVerificationDto } from '@/identity/application/dtos/email-verification.dto';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { emailVerificationEmail } from '@/identity/application/templates/email-verification.email';
import { SettingsService } from '@/settings/application/services/settings.service';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';

@Injectable()
export class ResendEmailVerificationUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly eventBus: EventBus,
    private readonly settingsService: SettingsService,
    private readonly captchaValidation: CaptchaValidationService,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
  ) {}

  async execute(
    hash: string,
    dto: ResendEmailVerificationDto,
    ip: string,
  ): Promise<{ hash: string }> {
    await this.captchaValidation.validate(dto, ip);

    const emailVerification =
      await this.prisma.emailVerification.findUnique({
        where: { hash },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      });

    if (!emailVerification) {
      throw new NotFoundException('Verification not found');
    }

    const now = new Date();

    // If user is blocked
    if (
      emailVerification.blockedUntil &&
      emailVerification.blockedUntil > now
    ) {
      const retryAt = emailVerification.blockedUntil.toISOString();
      throw new HttpException(
        {
          message: 'Resend temporarily blocked',
          reason: 'blocked',
          retryAt,
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Enforce interval between sends from settings (minutes)
    const intervalMinutes = await this.settingsService.findValueByName(
      'emailVerificationIntervalBetweenSendsTime',
    );
    const sentAt = emailVerification.sentAt ?? emailVerification.createdAt;
    const nextAllowed = new Date(
      sentAt.getTime() + Number(intervalMinutes) * 60 * 1000,
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

    // If sentCount reached limit, set block for few hours and deny this attempt
    const sentCount = await this.settingsService.findValueByName(
      'emailVerificationSentCount',
    );

    if ((emailVerification.sentCount ?? 1) >= sentCount) {
      const blockTime = await this.settingsService.findValueByName(
        'emailVerificationBlockTime',
      );
      const blockedUntil = new Date(
        now.getTime() + Number(blockTime) * 60 * 1000,
      );
      await this.prisma.emailVerification.update({
        where: { id: emailVerification.id },
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

    // generate new code and hash
    const newHash = crypto.randomUUID().toString();
    const newCode = Math.floor(100000 + Math.random() * 900000);

    // update record (keep single active verification)
    await this.prisma.emailVerification.update({
      where: { id: emailVerification.id },
      data: {
        code: newCode,
        hash: newHash,
        createdAt: new Date(),
        sentAt: now,
        sentCount: (emailVerification.sentCount ?? 1) + 1,
        blockedUntil: null,
      },
    });

    // send email with new code
    const lang = this.configService.get('LOCALE');
    const communityName =
      await this.settingsService.findValueByName('siteTitle');
    const logoUrl = await this.settingsService.findValueByName('siteLogoUrl');
    this.eventBus.publish(
      new EmailSendEvent(
        emailVerification.user.email,
        await emailVerificationEmail(
          emailVerification.user.name,
          newCode,
          communityName,
          logoUrl,
          {
            subject: await this.i18n.t('common.emails.verification.subject', {
              lang,
            }),
            hello: await this.i18n.t('common.emails.verification.hello', {
              args: { name: emailVerification.user.name },
              lang,
            }),
            text: await this.i18n.t('common.emails.verification.text', {
              lang,
            }),
            footer: await this.i18n.t('common.emails.verification.footer', {
              lang,
            }),
            footerText: await this.i18n.t('common.emails.all_rights_reserved', {
              lang,
            }),
          },
        ),
      ),
    );

    return { hash: newHash };
  }
}
