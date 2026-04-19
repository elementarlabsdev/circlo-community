import { EmailEventContextInterface } from '@/mail/domain/model/email-event-context.interface';
import { emailLayout } from '@/identity/application/templates/layout.email';

export async function emailChangeVerificationEmail(
  name: string,
  code: number,
  translations: {
    subject: string;
    hello: string;
    text: string;
    warning: string;
    footer: string;
    allRightsReserved: string;
  },
  communityName: string,
  logoUrl: string | undefined,
): Promise<EmailEventContextInterface> {
  const html = await emailLayout({
    title: translations.subject,
    previewText: translations.text,
    communityName,
    logoUrl,
    footerText: translations.allRightsReserved,
    content: `
      <mj-text font-size="20px" font-weight="bold" padding="0 0 20px 0">
        ${translations.hello ?? ''}
      </mj-text>
      <mj-text padding="0 0 20px 0">
        ${translations.text ?? ''}
      </mj-text>
      <mj-text font-size="36px" font-weight="bold" color="#4a5568" align="center" padding="30px 0" letter-spacing="5px">
        ${code?.toString() ?? ''}
      </mj-text>
      <mj-text font-size="14px" color="#666" padding="10px 0">
        ${translations.warning ?? ''}
      </mj-text>
      <mj-text font-size="14px" color="#666" padding="10px 0">
        ${translations.footer ?? ''}
      </mj-text>
    `,
  });

  return {
    subject: translations.subject,
    html,
  };
}
