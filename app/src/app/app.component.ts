import { afterNextRender, Component, DestroyRef, inject, OnInit, Renderer2, signal } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { PageLoadingBar } from '@ngstarter/components/page-loading-bar';
import { EnvironmentService, SeoService } from '@ngstarter/components/core';
import { DOCUMENT } from '@angular/common';
import { AppStore } from '@store/app.store';
import { ImageProxyService } from '@services/image-proxy.service';
import { TranslocoService } from '@jsverse/transloco';
import { environment } from '../environments/environment';
import { AnalyticsService } from '@services/analytics.service';
import { AdsenseService } from '@services/adsense.service';
import { NotificationService } from '@services/notification.service';
import { ApiService } from '@services/api.service';
import { ActionManager } from '@services/action-manager';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Dialog } from '@ngstarter/components/dialog';

declare let gtag: any;

import { CookieBannerComponent } from './@shared/cookie-banner/cookie-banner.component';
import {
  ReportAbuseDialogComponent,
  ReportAbuseDialogResult
} from '@modals/report-abuse-dialog/report-abuse-dialog.component';
import { ThreadDialogComponent, ThreadDialogResult } from '@modals/thread-dialog/thread-dialog';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    PageLoadingBar,
    CookieBannerComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  private notificationService = inject(NotificationService);
  private _envService = inject(EnvironmentService);
  private _analyticsService = inject(AnalyticsService);
  private _adsenseService = inject(AdsenseService);
  private _seoService = inject(SeoService);
  private _imageProxy = inject(ImageProxyService);
  private actionManager = inject(ActionManager);
  private destroyRef = inject(DestroyRef);
  private _router = inject(Router);
  private _document = inject(DOCUMENT);
  private _renderer = inject(Renderer2);
  private _appStore = inject(AppStore);
  private _translate = inject(TranslocoService);
  private api = inject(ApiService);
  private dialog = inject(Dialog);

  pageLoaded = signal(false);

  constructor() {
    this._translate.setAvailableLangs(['ru', 'en']);
    this._translate.setDefaultLang(environment.locale);
    this._translate.setActiveLang(environment.locale);

    afterNextRender(() => {
      // Scroll a page to top if url changed
      this._router.events
        .pipe(
          filter(event=> event instanceof NavigationEnd)
        )
        .subscribe(() => {
          this.api.loaded.set(true);
          // window.scrollTo({
          //   top: 0,
          //   left: 0
          // });
        });
    });
  }

  ngOnInit(): void {
    this._setHtmlLocale();
    this._setFavicon();
    this.setFontFamily();
    this._analyticsService.trackPageViews();
    this._adsenseService.init();
    this._seoService.trackCanonicalChanges(this._envService.getValue('siteUrl'));
    this.notificationService.initialize();
    this.actionManager
      .action
      .pipe(
        filter(event => event.action === 'addComplaint'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        const payload = event.payload;
        this.dialog.open<
          ReportAbuseDialogComponent, { targetType: string; targetId: string; reportedUrl?: string },
          ReportAbuseDialogResult
        >(ReportAbuseDialogComponent, {
          width: '640px',
          data: payload
        });
      });
    this.actionManager
      .action
      .pipe(
        filter(event => event.action === 'addThread'),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(event => {
        const payload = event.payload;
        this.dialog.open<
          ThreadDialogComponent, { threadId: string },
          ThreadDialogResult
        >(ThreadDialogComponent, {
          width: '740px',
          maxWidth: '740px',
          data: payload
        });
      });
  }

  private _setHtmlLocale(): void {
    let htmlElement = this._document.querySelector<HTMLElement>('html');

    if (htmlElement) {
      htmlElement.lang = environment.locale;
    }
  }

  private _setFavicon(): void {
    let faviconElement = this._document.querySelector<HTMLLinkElement>('link[rel*="icon"]');

    if (!faviconElement) {
      faviconElement = this._renderer.createElement('link') as HTMLLinkElement;
      faviconElement.rel = 'icon';
      this._renderer.appendChild(this._document.head, faviconElement)
    }

    faviconElement.href = this._imageProxy.transform(this._appStore.siteIconUrl());
  }

  private setFontFamily(): void {
    const systemFonts = ['system-ui', 'serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'inherit', 'initial', 'revert', 'revert-layer', 'unset'];
    const fontFamily = this._appStore.fontFamily();
    const isSystemFont = systemFonts.some(font => fontFamily.toLowerCase().includes(font.toLowerCase()));

    if (!isSystemFont) {
      const link = this._document.createElement('link');
      link.rel = 'stylesheet';
      link.crossOrigin = 'anonymous';
      link.href = `https://fonts.googleapis.com/css2?family=${fontFamily}:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,300;1,400;1,700;1,900&display=swap`;
      this._document.head.appendChild(link);
    }

    this._document.documentElement.style.setProperty('--font-sans', fontFamily);
  }
}
