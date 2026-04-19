import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import { resetPasswordEmail } from '@/identity/application/templates/reset-password.email';
import { SendResetPasswordCodeDto } from '@/identity/application/dtos/send-reset-password-code.dto';
import { PasswordReset } from '@/identity/domain/entities/password-reset.entity';
import {
  PASSWORD_RESET_REPOSITORY,
  PasswordResetRepositoryInterface,
} from '@/identity/domain/repositories/password-reset-repository.interface';
import * as crypto from 'crypto';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class SendResetPasswordCodeUseCase {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(PASSWORD_RESET_REPOSITORY)
    private readonly passwordResetRepository: PasswordResetRepositoryInterface,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(dto: SendResetPasswordCodeDto): Promise<PasswordReset> {
    const hash = crypto.randomUUID().toString();
    const code = Math.floor(100000 + Math.random() * 900000);
    let passwordReset = await this.passwordResetRepository.findByUserId({
      where: {
        userId: dto.user.id,
      },
    });

    if (!passwordReset) {
      passwordReset = await this.passwordResetRepository.create(
        PasswordReset.create({
          userId: dto.user.id,
          code,
          hash,
          sentAt: new Date(),
          sentCount: 1,
        }),
      );
    }
    const lang = this.configService.get('LOCALE');
    const communityName =
      await this.settingsService.findValueByName('siteTitle');
    const logoUrl = await this.settingsService.findValueByName('siteLogoUrl');
    this.eventBus.publish(
      new EmailSendEvent(
        dto.user.email.value,
        await resetPasswordEmail(dto.user.profile.name, code, communityName, logoUrl, {
          subject: await this.i18n.t('common.emails.reset_password.subject', {
            lang,
          }),
          hello: await this.i18n.t('common.emails.reset_password.hello', {
            args: { name: dto.user.profile.name },
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
    return passwordReset;
  }
}
