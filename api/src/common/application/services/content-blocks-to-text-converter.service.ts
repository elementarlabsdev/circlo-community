import { Injectable } from '@nestjs/common';

@Injectable()
export class ContentBlocksToTextConverter {
  convert(blocks: any[]): string {
    if (!Array.isArray(blocks)) {
      return '';
    }

    const textParts: string[] = [];

    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue;

      switch (block.type) {
        case 'paragraph':
        case 'heading':
          if (typeof block.content === 'string') {
            textParts.push(this.stripHtml(block.content));
          }
          break;

        case 'bulletList':
        case 'orderedList':
          if (Array.isArray(block.content)) {
            textParts.push(this.convertListItems(block.content));
          }
          break;

        case 'quote':
          if (block.content) {
            if (block.content.cite?.content) {
              textParts.push(this.stripHtml(block.content.cite.content));
            }
            if (block.content.caption?.content) {
              textParts.push(this.stripHtml(block.content.caption.content));
            }
          }
          break;

        case 'code':
          if (typeof block.content === 'string') {
            textParts.push(block.content);
          }
          break;

        case 'table':
          if (Array.isArray(block.content)) {
            textParts.push(this.convertTable(block.content));
          }
          break;

        case 'image':
          if (block.content?.alt) {
            textParts.push(block.content.alt);
          }
          break;

        case 'embed':
          if (block.content?.url) {
            textParts.push(block.content.url);
          }
          break;
      }
    }

    return textParts.filter((part) => !!part).join('\n\n');
  }

  private convertListItems(items: any[]): string {
    const listParts: string[] = [];
    for (const item of items) {
      if (typeof item.content === 'string') {
        listParts.push(this.stripHtml(item.content));
      }
      if (Array.isArray(item.children) && item.children.length > 0) {
        listParts.push(this.convertListItems(item.children));
      }
    }
    return listParts.join('\n');
  }

  private convertTable(rows: any[][]): string {
    const tableParts: string[] = [];
    for (const row of rows) {
      if (Array.isArray(row)) {
        const rowText = row
          .map((cell) => (cell?.content ? this.stripHtml(cell.content) : ''))
          .filter((t) => !!t)
          .join(' ');
        if (rowText) {
          tableParts.push(rowText);
        }
      }
    }
    return tableParts.join('\n');
  }

  private stripHtml(html: string): string {
    if (!html) return '';
    // Simple replacement of tags with empty string
    return html.replace(/<[^>]*>?/gm, '');
  }
}
