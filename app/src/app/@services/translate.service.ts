import { inject, Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslateService {
  private readonly transloco = inject(TranslocoService);

  instant(value: string, params?: any) {
    return this.transloco.translate(value, params);
  }

  translate(value: string, params?: any) {
    return this.transloco.translate(value, params);
  }
}
