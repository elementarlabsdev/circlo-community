import { Pipe, PipeTransform } from '@angular/core';
import { marked } from 'marked';
import markedAlert from 'marked-alert';
import markedShiki from 'marked-shiki';
import { codeToHtml } from 'shiki';

@Pipe({
  name: 'marked'
})
export class MarkedPipe implements PipeTransform {
  async transform(value: string) {
    return marked
      .use(markedAlert())
      .use(markedShiki({
        async highlight(code: string, lang: string) {
          return codeToHtml(code, { lang: lang.toLowerCase(), theme: 'min-light' })
        },
        container: `<figure class="highlighted-code">
<div class="code-language">%l</div>
%s
</figure>
`
      }))
      .parse(value);
  }
}
