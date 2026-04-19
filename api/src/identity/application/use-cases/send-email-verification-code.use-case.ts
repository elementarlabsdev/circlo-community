import { Inject, Injectable } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { SendEmailVerificationCodeDto } from '@/identity/application/dtos/send-email-verification-code.dto';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  EMAIL_VERIFICATION_REPOSITORY,
  EmailVerificationRepositoryInterface,
} from '@/identity/domain/repositories/email-verification-repository.interface';
import { EmailVerification } from '@/identity/domain/entities/email-verification.entity';
import { emailVerificationEmail } from '@/identity/application/templates/email-verification.email';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class SendEmailVerificationCodeUseCase {
  constructor(
    private readonly eventBus: EventBus,
    @Inject(EMAIL_VERIFICATION_REPOSITORY)
    private readonly emailVerificationRepository: EmailVerificationRepositoryInterface,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(dto: SendEmailVerificationCodeDto): Promise<string> {
    const user = dto.user;
    const hash = crypto.randomUUID().toString();
    const code = Math.floor(100000 + Math.random() * 900000);
    await this.emailVerificationRepository.save(
      EmailVerification.create({
        userId: user.id,
        code,
        hash,
        sentAt: new Date(),
        sentCount: 1,
        blockedUntil: null,
      }),
    );
    const lang = this.configService.get('LOCALE');
    const communityName =
      await this.settingsService.findValueByName('siteTitle');
    const logoUrl = await this.settingsService.findValueByName('siteLogoUrl');
    this.eventBus.publish(
      new EmailSendEvent(
        user.email.value,
        await emailVerificationEmail(user.profile.name, code, communityName, logoUrl, {
          subject: await this.i18n.t('common.emails.verification.subject', {
            lang,
          }),
          hello: await this.i18n.t('common.emails.verification.hello', {
            args: { name: user.profile.name },
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
        }),
      ),
    );
    return hash;
  }
}
