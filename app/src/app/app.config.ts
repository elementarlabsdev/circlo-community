import {
  ApplicationConfig, importProvidersFrom,
  inject, isDevMode, LOCALE_ID, makeStateKey, PLATFORM_ID,
  provideAppInitializer,
  provideZoneChangeDetection,
  TransferState,
} from '@angular/core';
import { provideRouter, TitleStrategy, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { Meta, provideClientHydration, withEventReplay, withI18nSupport } from '@angular/platform-browser';

import { routes } from './app.routes';
import { HttpClient, provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { FORM_FIELD_DEFAULT_OPTIONS } from '@ngstarter-ui/components/form-field';
import { firstValueFrom, tap, of, from } from 'rxjs';
import { ApiService } from '@services/api.service';
import { responseInterceptor } from '@interceptors/response.interceptor';
import { authInterceptor } from '@interceptors/auth.interceptor';
import { paymentInterceptor } from '@interceptors/payment.interceptor';
import { GlobalStore } from '@ngstarter-ui/components/core';
import { AppStore } from '@store/app.store';
import { MetaTag } from '@model/interfaces';
import { provideTransloco, translocoConfig, TranslocoLoader } from '@jsverse/transloco';
import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import { CaptchaService } from '@services/captcha.service';
import { TranslatedPageTitleStrategyService } from '@services/translated-page-title-strategy.service';
import { PaginatorIntl } from '@ngstarter-ui/components/paginator';
import { TranslatedPaginatorIntl } from '@app/translated-paginator.intl';
import { WIDGETS } from '@/types';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { environment } from '../environments/environment';
import { COLOR_SCHEME_LOCAL_KEY, ColorScheme, ColorSchemeStore } from '@ngstarter-ui/components/color-scheme';
import { LayoutSidebarStore } from '@ngstarter-ui/components/layout';
import { provideTranslocoLocale } from '@jsverse/transloco-locale';
import { provideNativeDateAdapter } from '@ngstarter-ui/components/datepicker';
import { provideDataView } from '@ngstarter-ui/components/data-view';
import { SettingsMap, SettingsService } from '@services/settings.service';

import { Ability, createMongoAbility } from '@casl/ability';
import { AbilityService } from '@services/ability.service';
import { provideTranslocoMessageformat } from '@jsverse/transloco-messageformat';

const config: SocketIoConfig = {
  url: environment.websocketUrl,
  options: {
    autoConnect: false
  }
};

class UniversalTranslocoLoader implements TranslocoLoader {
  private platformId = inject(PLATFORM_ID);
  private http = inject(HttpClient);
  private transferState = inject(TransferState);

  getTranslation(lang: string) {
    const key = makeStateKey<any>(`transloco-${lang}`);

    if (isPlatformBrowser(this.platformId)) {
      const cached = this.transferState.get(key, null);
      if (cached) {
        this.transferState.remove(key);
        return of(cached);
      }
      return this.http.get(`/i18n/${lang}.json`);
    }

    try {
      const fs = require('node:fs');
      const path = require('node:path');
      const file = path.join(process.cwd(), 'dist', 'circlo', 'browser', 'i18n', `${lang}.json`);
      const content = fs.readFileSync(file, 'utf-8');
      const json = JSON.parse(content);
      this.transferState.set(key, json);
      return of(json);
    } catch (e) {
      return of({});
    }
  }
}

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: LOCALE_ID, useValue: environment.locale },
    ColorSchemeStore,
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideTransloco({
      config: translocoConfig({
        availableLangs: ['en', 'ru', 'es', 'fr', 'de', 'it', 'pt', 'zh', 'ja', 'ko', 'ar', 'hi', 'tr', 'nl', 'pl', 'vi', 'th', 'id', 'sv', 'da', 'fi', 'no', 'cs', 'el', 'hu', 'ro', 'bg', 'sk', 'uk', 'he', 'fa', 'ms'],
        defaultLang: environment.locale,
        reRenderOnLangChange: true,
        prodMode: !isDevMode(),
      }),
      loader: UniversalTranslocoLoader,
    }),
    provideDataView({
      headerHeight: 46,
      pageSizeOptions: [50, 100, 200],
      pageSize: 50,
      embedded: true,
    }),
    provideTranslocoLocale(),
    provideTranslocoMessageformat(),
    provideNativeDateAdapter(),
    {
      provide: PaginatorIntl,
      useClass: TranslatedPaginatorIntl,
    },
    provideClientHydration(withEventReplay()),
    provideRouter(
      routes,
      withViewTransitions(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
      })
    ),
    provideHttpClient(
      withFetch(),
      withInterceptors([
        authInterceptor,
        paymentInterceptor,
        responseInterceptor
      ])
    ),
    provideStore(),
    {
      provide: Ability,
      useFactory: () => createMongoAbility()
    },
    provideAppInitializer(() => {
      const platformId = inject(PLATFORM_ID);
      const apiService = inject(ApiService);
      const globalStore = inject(GlobalStore);
      const appStore = inject(AppStore);
      const captchaService = inject(CaptchaService);
      const colorSchemeStore = inject(ColorSchemeStore);
      const layoutSidebarStore = inject(LayoutSidebarStore);
      const meta = inject(Meta);
      inject(AbilityService);

      const settingsService = inject(SettingsService);

      if (isPlatformBrowser(platformId)) {
        layoutSidebarStore.showSidebarVisibility('root', localStorage.getItem('sidebarVisibility') === 'true');
      }

      const initialize = from(settingsService.reload()).pipe(
        tap((res: SettingsMap) => {
          globalStore.setPageTitle(res.siteTitle);
          appStore.setAnnouncement(res.announcement);
          appStore.setRecaptchaSiteKey(res.recaptchaSiteKey);
          appStore.setCapJsSiteKey(res.capJsSiteKey);
          appStore.setSiteDescription(res.metaDescription);
          appStore.setSiteName(res.siteName);
          appStore.setProfile(res.profile as any);
          appStore.setIsLogged(res.isLogged);
          appStore.setIsRegistrationEnabled(res.registrationEnabled);
          appStore.setIsCommentsEnabled(res.commentsEnabled);
          appStore.setSiteLogoUrl(res.siteLogoUrl);
          appStore.setSiteIconUrl(res.siteIconUrl);
          appStore.setSocialMediaLinks(res.socialMediaLinks);
          appStore.setUnreadNotificationsCount(res.unreadNotificationsCount);
          appStore.setImageProxyUrl(res.imageProxyUrl);
          appStore.setAnalyticsProvider(res.analyticsProvider);
          appStore.setAdsProvider(res.adsProvider);
          appStore.setHostUrl(res.hostUrl);
          appStore.setFontFamily(res.fontFamily);
          appStore.setIsPublicCommunity(res.isPublicCommunity);
          appStore.setMonetizationCreditsEnabled(res.monetizationCreditsEnabled);
          appStore.setRules(res.rules || []);
          appStore.setMetaTags(res.metaTags || []);

          if (res.metaTags && res.metaTags.length > 0) {
            res.metaTags.forEach((tag: MetaTag) => {
              if (tag.type === 'name' && tag.name) {
                meta.updateTag({ name: tag.name, content: tag.content });
              } else if (tag.type === 'property' && tag.property) {
                meta.updateTag({ property: tag.property, content: tag.content });
              }
            });
          }

          captchaService.initialize();

          if (res.isLogged && isPlatformBrowser(platformId)) {
            const consent = localStorage.getItem('cookie-consent');
            const preferences = localStorage.getItem('cookie-preferences');

            if (consent === 'true' && !res.profile.cookieConsent) {
              let prefs = {};
              try {
                prefs = JSON.parse(preferences || '{}');
              } catch (e) {}
              apiService.post('identity/sync-cookies', {
                cookieConsent: true,
                cookiePreferences: prefs
              }).subscribe();
              res.profile.cookieConsent = true;
            }
          }

          if (!res.isLogged) {
            if (isPlatformBrowser(platformId)) {
              const localColorScheme = localStorage
                ? (localStorage.getItem(COLOR_SCHEME_LOCAL_KEY) as ColorScheme || 'light')
                : 'light';
              colorSchemeStore.setScheme(localColorScheme);
            }
          } else {
            colorSchemeStore.setScheme(res.profile.preferredColorScheme);
          }
        })
      );

      return firstValueFrom(initialize).catch(() => {
        return Promise.resolve();
      });
    }),
    importProvidersFrom(SocketIoModule.forRoot(config)),
    {
      provide: TitleStrategy,
      useClass: TranslatedPageTitleStrategyService
    },
    {
      provide: FORM_FIELD_DEFAULT_OPTIONS,
      useValue: { appearance: 'outline' }
    },
    {
      provide: WIDGETS,
      useValue: {
        recommendedTopics: import('./@widgets/recommended-topics/recommended-topics.widget')
          .then(c => c.RecommendedTopicsWidget),
        recommendedChannels: import('./@widgets/recommended-channels/recommended-channels.widget')
          .then(c => c.RecommendedChannelsWidget),
        socialMediaLinks: import('./@widgets/social-media-links/social-media-links.widget')
          .then(c => c.SocialMediaLinksWidget),
      }
    }
  ]
};
