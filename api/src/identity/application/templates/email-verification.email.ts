import { EmailEventContextInterface } from '@/mail/domain/model/email-event-context.interface';
import { emailLayout } from './layout.email';

export async function emailVerificationEmail(
  name: string,
  code: number,
  communityName: string,
  logoUrl: string | undefined,
  translations: {
    subject: string;
    hello: string;
    text: string;
    footer: string;
    footerText?: string;
  },
): Promise<EmailEventContextInterface> {
  const html = await emailLayout({
    title: translations.subject,
    previewText: translations.text,
    communityName,
    logoUrl,
    footerText: translations.footerText,
    content: `
      <mj-text font-size="20px" font-weight="bold" padding="0 0 20px 0">
        ${translations.hello ?? ''}
      </mj-text>
      <mj-text padding="0 0 20px 0">
        ${translations.text ?? ''}
      </mj-text>
      <mj-text font-size="36px" font-weight="bold" color="#2563eb" align="center" padding="30px 0" letter-spacing="5px">
        ${code?.toString() ?? ''}
      </mj-text>
      <mj-text font-size="14px" color="#737373" padding="20px 0">
        ${translations.footer ?? ''}
      </mj-text>
    `,
  });

  return {
    subject: translations.subject,
    html,
  };
}
