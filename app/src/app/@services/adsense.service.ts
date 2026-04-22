import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppStore } from '@store/app.store';

@Injectable({
  providedIn: 'root'
})
export class AdsenseService {
  private _appStore = inject(AppStore);
  private _document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private loaded = false;

  init(): void {
    if (!isPlatformBrowser(this.platformId) || this.loaded) {
      return;
    }

    const adsProvider = this._appStore.adsProvider();
    let adsensePubId = null;

    if (adsProvider && adsProvider.type === 'googleAdsense') {
      adsensePubId = adsProvider.config.googleAdsensePubId;
    }

    if (isDevMode() || !adsensePubId) {
      return;
    }

    const url = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsensePubId}`;
    const script = this._document.createElement('script');
    script.async = true;
    script.src = url;
    script.crossOrigin = 'anonymous';
    this._document.head.appendChild(script);
    const dataLayerScript = this._document.createElement('script');
    this._document.head.appendChild(dataLayerScript);
    this.loaded = true;
  }
}
