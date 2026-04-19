import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import NotifmeSdk from 'notifme-sdk';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MailProvider } from '@prisma/client';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private _notifierSdk: NotifmeSdk;
  private systemEmail: string;

  constructor(
    private settingsService: SettingsService,
    private prisma: PrismaService,
  ) {}

  async send(recipientEmail: string, subject: string, html: string) {
    if (!html || html.trim() === '') {
      this.logger.warn(
        `Attempting to send an email with empty HTML content to ${recipientEmail} with subject "${subject}". Adding fallback content.`,
      );
      html = `<p>${subject}</p>`;
    }
    this.systemEmail =
      await this.settingsService.findValueByName('systemEmail');
    const mailProviders = await this.prisma.mailProvider.findMany({
      where: {
        isConfigured: true,
        isEnabled: true,
        isDefault: true,
      },
    });
    const notifierProviders = [];
    mailProviders.forEach((mailProvider) => {
      if (mailProvider.type === 'resend') {
        notifierProviders.push(this.configureResend(mailProvider));
      } else if (mailProvider.type === 'aws-ses') {
        notifierProviders.push(this.configureAwsSes(mailProvider));
      } else if (mailProvider.type === 'sendgrid') {
        notifierProviders.push(this.configureSendgrid(mailProvider));
      }
    });
    this._notifierSdk = new NotifmeSdk({
      channels: {
        email: {
          multiProviderStrategy: 'fallback',
          providers: notifierProviders,
        },
      },
    });
    const mailDomain = await this.settingsService.findValueByName('mailDomain');
    const mailFrom = await this.settingsService.findValueByName('mailFrom');
    await this._notifierSdk.send({
      email: {
        from: `${mailFrom} <noreply@${mailDomain}>`,
        to: recipientEmail,
        subject,
        html,
      },
    });
  }

  private configureResend(mailProvider: MailProvider) {
    return {
      type: 'custom',
      id: 'resend',
      send: async (request: any) => {
        const resend = new Resend(mailProvider.config['apiKey']);
        const { data, error } = await resend.emails.send({
          from: request.from,
          to: [request.to],
          subject: request.subject,
          html: request.html,
        });

        if (error) {
          this.logger.error(
            `Resend error sending email to ${request.to} with subject "${request.subject}": ${error.message}`,
          );
          throw new Error(error.message);
        }

        return data.id;
      },
    };
  }

  private configureAwsSes(mailProvider: MailProvider) {
    return {
      type: 'ses',
      region: mailProvider.config['region'],
      accessKeyId: mailProvider.config['accessKeyId'],
      secretAccessKey: mailProvider.config['secretAccessKey'],
    };
  }

  private configureSendgrid(mailProvider: MailProvider) {
    return {
      type: 'sendgrid',
      apiKey: mailProvider.config['apiKey'],
      from: this.systemEmail,
    };
  }
}
