import mjml = require('mjml');

const mjml2html = (mjml as any).default || mjml;

export interface EmailLayoutProps {
  title: string;
  previewText?: string;
  communityName: string;
  logoUrl?: string;
  footerText?: string;
  content: string;
}

export async function emailLayout(props: EmailLayoutProps): Promise<string> {
  const mjml = `
    <mjml>
      <mj-head>
        <mj-title>${props.title ?? ''}</mj-title>
        ${props.previewText ? `<mj-preview>${props.previewText}</mj-preview>` : ''}
        <mj-attributes>
          <mj-all font-family="Helvetica, Arial, sans-serif" font-size="16px" color="#171717" line-height="1.5" />
          <mj-button background-color="#2563eb" color="white" border-radius="4px" font-weight="bold" />
        </mj-attributes>
      </mj-head>
      <mj-body background-color="#fafafa">
        <mj-section padding="20px 0">
          <mj-column>
            ${
              props.logoUrl
                ? `<mj-image src="${props.logoUrl}" alt="${props.communityName ?? ''}" width="100px" padding="20px" />`
                : `<mj-text font-size="24px" font-weight="bold" color="#171717" align="center" padding="20px">${
                    props.communityName ?? ''
                  }</mj-text>`
            }
          </mj-column>
        </mj-section>
        <mj-section background-color="#ffffff" padding="40px 30px" border-radius="8px">
          <mj-column>
            ${props.content}
          </mj-column>
        </mj-section>
        <mj-section padding="20px 0">
          <mj-column>
            <mj-text font-size="12px" color="#737373" align="center">
              &copy; ${new Date().getFullYear()} ${props.communityName ?? ''}. ${props.footerText ?? ''}
            </mj-text>
          </mj-column>
        </mj-section>
      </mj-body>
    </mjml>
  `;

  const result = await mjml2html(mjml);

  return result.html;
}
