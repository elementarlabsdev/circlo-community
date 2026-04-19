import { EmailEventContextInterface } from '@/mail/domain/model/email-event-context.interface';
import { emailLayout } from './layout.email';

export async function adminCreatedUserEmail(
  name: string,
  email: string,
  password: string,
  loginUrl: string,
  communityName: string,
  logoUrl: string | undefined,
  translations: {
    subject: string;
    hello: string;
    text: string;
    email: string;
    password: string;
    login_button: string;
    password_notice: string;
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
      <mj-table padding="20px" background-color="#f5f5f5" border-radius="4px">
        <tr>
          <td style="padding: 5px 10px; font-weight: bold; width: 100px;">${translations.email}:</td>
          <td style="padding: 5px 10px;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 5px 10px; font-weight: bold;">${translations.password}:</td>
          <td style="padding: 5px 10px;"><code style="color: #2563eb; background: #fff; padding: 2px 4px; border-radius: 3px; border: 1px solid #e5e5e5;">${password}</code></td>
        </tr>
      </mj-table>
      <mj-text font-size="14px" color="#737373" padding="20px 0">
        ${translations.password_notice ?? ''}
      </mj-text>
      <mj-button href="${loginUrl || '#'}" padding="20px 0" align="center">
        ${translations.login_button ?? ''}
      </mj-button>
    `,
  });

  return {
    subject: translations.subject,
    html,
  };
}
