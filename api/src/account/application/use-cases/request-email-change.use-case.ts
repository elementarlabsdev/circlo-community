import { Inject, Injectable, BadRequestException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { EmailChange } from '../../domain/entities/email-change.entity';
import {
  EMAIL_CHANGE_REPOSITORY,
  EmailChangeRepositoryInterface,
} from '../../domain/repositories/email-change-repository.interface';
import { EventBus } from '@nestjs/cqrs';
import { emailChangeVerificationEmail } from '@/account/application/templates/email-change-verification.email';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';

@Injectable()
export class RequestEmailChangeUseCase {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMAIL_CHANGE_REPOSITORY)
    private readonly repo: EmailChangeRepositoryInterface,
    private readonly eventBus: EventBus,
    private readonly i18n: I18nService,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(userId: string, currentEmail: string, newEmailRaw: string) {
    const newEmail = newEmailRaw.trim().toLowerCase();

    if (newEmail === currentEmail.toLowerCase()) {
      throw new BadRequestException('EMAIL_SAME_AS_CURRENT');
    }

    const existing = await this.prisma.user.findUnique({
      where: { email: newEmail },
    });

    if (existing) {
      throw new BadRequestException('EMAIL_ALREADY_IN_USE');
    }

    const code = Math.floor(100000 + Math.random() * 900000);
    const codeHash = await bcrypt.hash(code.toString(), 10);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await this.repo.upsert(
      EmailChange.create({ userId, newEmail, codeHash, expiresAt }),
    );
    const lang = this.configService.get('LOCALE');
    const communityName =
      await this.settingsService.findValueByName('siteTitle');
    const logoUrl = await this.settingsService.findValueByName('siteLogoUrl');

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
    });

    this.eventBus.publish(
      new EmailSendEvent(
        currentEmail,
        await emailChangeVerificationEmail(
          user.name,
          code,
          {
            subject: await this.i18n.t('common.emails.email_change.subject', {
              lang,
            }),
            hello: await this.i18n.t('common.emails.email_change.hello', {
              args: { name: user.name },
              lang,
            }),
            text: await this.i18n.t('common.emails.email_change.text', {
              lang,
            }),
            warning: await this.i18n.t('common.emails.email_change.warning', {
              lang,
            }),
            footer: await this.i18n.t('common.emails.email_change.footer', {
              lang,
            }),
            allRightsReserved: await this.i18n.t(
              'common.emails.all_rights_reserved',
              { lang },
            ),
          },
          communityName,
          logoUrl,
        ),
      ),
    );

    return { ok: true };
  }
}
