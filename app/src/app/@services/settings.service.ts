import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '@services/api.service';

import { MetaTag, UserProfile } from '@model/interfaces';

export interface SettingsMap {
  profile: UserProfile & { cookieConsent?: boolean };
  siteTitle: string;
  announcement: any;
  recaptchaSiteKey: string;
  capJsSiteKey: string;
  metaDescription: string;
  siteName: string;
  isLogged: boolean;
  registrationEnabled: boolean;
  commentsEnabled: boolean;
  siteLogoUrl: string;
  siteIconUrl: string;
  socialMediaLinks: any[];
  unreadNotificationsCount: number;
  imageProxyUrl: string;
  hostUrl: string;
  fontFamily: string;
  isPublicCommunity: boolean;
  monetizationCreditsEnabled: boolean;
  rules: any[];
  metaTags: MetaTag[];
  analyticsProvider: any;
  adsProvider: any;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private api = inject(ApiService);
  private cacheSignal = signal<SettingsMap | null>(null);

  private loadingPromise: Promise<SettingsMap> | null = null;

  async reload(): Promise<SettingsMap> {
    this.cacheSignal.set(null);
    return this.loadAll();
  }

  private async loadAll(): Promise<SettingsMap> {
    const currentCache = this.cacheSignal();
    if (currentCache) return currentCache;
    if (this.loadingPromise) return this.loadingPromise;

    this.loadingPromise = new Promise<SettingsMap>((resolve, reject) => {
      this.api.get('initialize').subscribe({
        next: (res: any) => {
          const data: SettingsMap = (res ?? {}) as SettingsMap;
          this.cacheSignal.set(data);
          this.loadingPromise = null;
          resolve(data);
        },
        error: (err) => {
          this.loadingPromise = null;
          reject(err);
        }
      });
    });
    return this.loadingPromise;
  }

  async findValueByName<T = any>(name: string, defaultValue: T | null = null): Promise<T> {
    try {
      const settings = await this.loadAll();
      const value = (settings as any)[name];
      return (value !== undefined && value !== null ? (value as T) : (defaultValue as T));
    } catch {
      return defaultValue as T;
    }
  }

  setting<T = any>(name: string, defaultValue: T | null = null) {
    if (!this.cacheSignal()) {
      this.loadAll();
    }
    return computed(() => {
      const settings = this.cacheSignal();
      if (!settings) return defaultValue as T;
      const value = (settings as any)[name];
      return (value !== undefined && value !== null ? (value as T) : (defaultValue as T));
    });
  }
}
