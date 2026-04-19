import { inject, Injectable, PLATFORM_ID, NgZone } from '@angular/core';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { AppStore } from '@store/app.store';
import Cap from '@cap.js/widget';

declare const grecaptcha: any;

export interface CaptchaResult {
  token: string;
  type: string;
}

export interface CaptchaConfig {
  type: string;
  siteKey?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CaptchaService {
  private document = inject(DOCUMENT);
  private platformId = inject(PLATFORM_ID);
  private snackBar = inject(SnackBar);
  private translocoService = inject(TranslocoService);
  private appStore = inject<any>(AppStore);
  private ngZone = inject(NgZone);
  private capInstance: any = null;

  getCaptchaConfig(): CaptchaConfig | null {
    if (this.appStore.capJsSiteKey()) {
      return { type: 'local', siteKey: this.appStore.capJsSiteKey() };
    } else if (this.appStore.recaptchaSiteKey()) {
      return { type: 'recaptcha', siteKey: this.appStore.recaptchaSiteKey() };
    }
    return null;
  }

  initialize(config?: CaptchaConfig | null): void {
    const activeConfig = config || this.getCaptchaConfig();
    if (activeConfig) {
      this.ensureCaptchaScript(activeConfig);

      if (activeConfig.type === 'local' && activeConfig.siteKey && isPlatformBrowser(this.platformId)) {
        const serverUrl = this.getCaptchaServerUrl();
        this.capInstance = new Cap({
          apiEndpoint: `${serverUrl}/${activeConfig.siteKey}/`,
        });
      }
    }
  }

  async execute(action: string = 'register'): Promise<CaptchaResult | null | true> {
    const config = this.getCaptchaConfig();
    if (!config) {
      return true;
    }

    try {
      const token = await this.getCaptchaToken(config, action);
      return { token, type: config.type };
    } catch (err) {
      this.snackBar.open(
        this.translocoService.translate('common.captcha.load-error'),
        this.translocoService.translate('common.dismiss'),
        { duration: 3500 }
      );
      console.error('Captcha execution failed:', err);
      return null;
    }
  }

  /**
   * Injects the captcha token into the provided data object.
   * Based on the captcha type, it will set 'recaptchaToken' or 'captchaToken'.
   */
  injectToken(data: any, result: CaptchaResult | null | true): any {
    if (!result || result === true) {
      return data;
    }

    if (result.type === 'recaptcha') {
      data.recaptchaToken = result.token;
    } else if (result.type === 'local') {
      data.captchaToken = result.token;
    }

    return data;
  }

  private getCaptchaServerUrl(): string {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    const hostname = window.location.hostname;

    // Local development
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.endsWith('.test')) {
      return 'http://localhost:3001';
    }

    const domain = hostname.split('.').slice(-2).join('.');
    return `https://captcha.${domain}`;
  }

  ensureCaptchaScript(config: CaptchaConfig): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    if (config.type === 'recaptcha' && config.siteKey) {
      const src = `https://www.google.com/recaptcha/enterprise.js?render=${encodeURIComponent(config.siteKey)}`;
      const existing = (Array.from(this.document.querySelectorAll('script')) as HTMLScriptElement[])
        .find(s => s.src === src || s.src.includes('/recaptcha/enterprise.js')) || null;

      if (!existing) {
        const script = this.document.createElement('script');
        script.id = 'recaptcha-script';
        script.src = src;
        script.async = true;
        script.defer = true;
        this.document.head.appendChild(script);
      }
    }
  }

  async getCaptchaToken(config: CaptchaConfig, action: string = 'register'): Promise<string> {
    if (!isPlatformBrowser(this.platformId)) {
      return '';
    }

    if (config.type === 'recaptcha' && config.siteKey) {
      await this.ensureRecaptchaReady();
      return new Promise<string>((resolve, reject) => {
        grecaptcha.enterprise.ready(async () => {
          try {
            const token = await grecaptcha.enterprise.execute(config.siteKey, { action });
            resolve(token);
          } catch (e) {
            reject(e);
          }
        });
      });
    } else if (config.type === 'local' && config.siteKey) {
      if (!this.capInstance) {
        const serverUrl = this.getCaptchaServerUrl();
        this.capInstance = new Cap({
          apiEndpoint: `${serverUrl}/${config.siteKey}/`,
        });
      }

      const { token } = await this.capInstance.solve();
      return token;
    }
    return '';
  }

  private ensureRecaptchaReady(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ngZone.runOutsideAngular(() => {
        const check = () => {
          if (typeof grecaptcha !== 'undefined' && grecaptcha.enterprise) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
        // Add a timeout to avoid infinite loop
        setTimeout(() => reject(new Error('reCAPTCHA Enterprise timeout')), 10000);
      });
    });
  }
}
