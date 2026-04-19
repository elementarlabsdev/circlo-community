import { inject, Injectable } from '@angular/core';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { GlobalStore } from '@ngstarter/components/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class TranslatedPageTitleStrategyService extends TitleStrategy {
  private _title = inject(Title);
  private _globalStore = inject(GlobalStore);
  private _translate = inject(TranslocoService);

  override updateTitle(routerState: RouterStateSnapshot) {
    const title = this.buildTitle(routerState);

    if (title !== undefined) {
      const translate$ = this._translate.selectTranslate(title);
      translate$.subscribe(translatedTitle => {
        this._title.setTitle(`${translatedTitle} | ${this._globalStore.pageTitle()}`);
      });
    } else {
      this._title.setTitle(this._globalStore.pageTitle());
    }
  }
}
