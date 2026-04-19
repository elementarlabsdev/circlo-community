import { Injectable, OnModuleInit } from '@nestjs/common';
import MarkdownIt from 'markdown-it';
import shiki from '@shikijs/markdown-it';
import { codeToHtml } from 'shiki';

@Injectable()
export class MarkdownService implements OnModuleInit {
  private md = new MarkdownIt({
    linkify: true,
    breaks: true,
  });

  async onModuleInit() {
    const plugin = await shiki({
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    });
    this.md.use(plugin);
  }

  render(content: string): string {
    return this.md.render(content);
  }

  async highlightCode(html: string): Promise<string> {
    const codeBlockRegex = /<pre><code(?:\s+class="language-([^"]+)")?>([\s\S]*?)<\/code><\/pre>/g;
    let match;
    let result = html;

    while ((match = codeBlockRegex.exec(html)) !== null) {
      const fullMatch = match[0];
      const lang = match[1] || 'text';
      const code = match[2]
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");

      try {
        const highlighted = await codeToHtml(code, {
          lang,
          theme: 'github-light',
        });
        result = result.replace(fullMatch, highlighted);
      } catch (e) {
        console.error('Shiki highlighting failed', e);
      }
    }

    return result;
  }
}
