import { inject, Injectable, isDevMode, PLATFORM_ID } from '@angular/core';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { AppStore } from '@store/app.store';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  private _appStore = inject(AppStore);
  private _router = inject(Router);
  private _document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private loaded = false;
  private googleAnalyticsId: string;

  init() {
    if (!isPlatformBrowser(this.platformId) || this.loaded) {
      return;
    }

    const analyticsProvider = this._appStore.analyticsProvider();
    let googleAnalyticsId = null;

    if (analyticsProvider && analyticsProvider.type === 'googleAnalytics') {
      googleAnalyticsId = analyticsProvider.config.googleAnalyticsId;
    }

    if (isDevMode() || !googleAnalyticsId) {
      return;
    }

    this.googleAnalyticsId = googleAnalyticsId;

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;

    this._document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () {
      window.dataLayer.push(arguments);
    };

    window.gtag('js', new Date());
    window.gtag('config', googleAnalyticsId);

    this.loaded = true;

    this._router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.pageView(event.urlAfterRedirects);
      });
  }

  pageView(url: string): void {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', this.googleAnalyticsId, {
        page_path: url
      });
    }
  }
}
