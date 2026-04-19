import { inject, Pipe, PipeTransform, Sanitizer, SecurityContext } from '@angular/core';
import { codeToHtml } from 'shiki';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
  name: 'convertCode'
})
export class ConvertCodePipe implements PipeTransform {
  private _domSanitizer = inject(DomSanitizer);

  async transform(code: string, lang: string): Promise<SafeHtml> {
    return codeToHtml(code, {
      lang,
      theme: 'github-light'
    }).then(result => {
      return this._domSanitizer.bypassSecurityTrustHtml(result);
    });
  }
}
