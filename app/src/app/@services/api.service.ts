import {
  inject,
  Injectable,
  isDevMode,
  PLATFORM_ID,
  REQUEST_CONTEXT,
  signal,
  makeStateKey,
  TransferState
} from '@angular/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { DOCUMENT, isPlatformBrowser, isPlatformServer } from '@angular/common';
import { Observable, of, tap } from 'rxjs';
import { AUTH_TOKEN_NAME } from '@/types';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private _cookieService = inject(SsrCookieService);
  private _platformId = inject(PLATFORM_ID);
  private _httpClient = inject(HttpClient);
  private _transferState = inject(TransferState);
  private document = inject(DOCUMENT);

  reqContext = inject<{
    circloAuthToken?: string,
  }>(REQUEST_CONTEXT, { optional: true });

  readonly loaded = signal(false);

  private _getRequestKey<T>(method: string, url: string, options: any = {}, body: any = null) {
    // Normalize URL to a relative path to ensure keys match between server and client
    let path = url;
    if (url.startsWith('http')) {
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname + urlObj.search;
      } catch (e) {}
    }

    const paramsString = options.params ? JSON.stringify(options.params) : '';
    const bodyString = body ? JSON.stringify(body) : '';
    return makeStateKey<T>(`api-${method}-${path}-${paramsString}-${bodyString}`);
  }

  getApiEndpoint(): string {
    if (isDevMode()) {
      if (isPlatformServer(this._platformId)) {
        return 'http://localhost:3000/api/v1/';
      }

      if (environment.apiUrl === 'http://api:3000/api/v1/') {
        return '/api/v1/';
      }
    } else {
      // prod mode

      // if dev in prod mode
      if (this.document.location.hostname === 'localhost') {
        return 'http://localhost:3000/api/v1/';
      }

      if (isPlatformServer(this._platformId)) {
        return 'http://api:3000/api/v1/';
      }
    }

    return environment.apiUrl;
  }

  getAuthToken(): string | undefined {
    return this.reqContext?.circloAuthToken || this._cookieService.get(AUTH_TOKEN_NAME);
  }

  getAuthorizationHeader(): object {
    return {
      'Authorization': `Bearer ${this.getAuthToken()}`
    };
  }

  get<T>(url: string, options: any = {}) {
    const fullUrl = this.getApiEndpoint() + url;
    const key = this._getRequestKey<T>('GET', fullUrl, options);

    if (isPlatformBrowser(this._platformId)) {
      const cached = this._transferState.get(key, null);
      if (cached) {
        this._transferState.remove(key);
        return of(cached);
      }
    }

    return (this._httpClient.get(fullUrl, {
      observe: 'body',
      responseType: 'json',
      transferCache: false,
      ...options
    }) as Observable<T>).pipe(
      tap(res => {
        if (isPlatformServer(this._platformId)) {
          this._transferState.set(key, res);
        }
      })
    );
  }

  post<T>(url: string, body: any = {}, options: any = {}): Observable<T> {
    const fullUrl = this.getApiEndpoint() + url;
    const key = this._getRequestKey<T>('POST', fullUrl, options, body);

    if (isPlatformBrowser(this._platformId)) {
      const cached = this._transferState.get(key, null);
      if (cached) {
        this._transferState.remove(key);
        return of(cached);
      }
    }

    return (this._httpClient.post(fullUrl, body, {
      observe: 'body',
      responseType: 'json',
      transferCache: false,
      ...options
    }) as Observable<T>).pipe(
      tap(res => {
        if (isPlatformServer(this._platformId)) {
          this._transferState.set(key, res);
        }
      })
    );
  }

  patch<T>(url: string, body: any = {}, options: any = {}): Observable<T> {
    return this._httpClient.patch(this.getApiEndpoint() + url, body, {
      observe: 'body',
      responseType: 'json',
      ...options
    }) as Observable<T>;
  }

  put<T>(url: string, body: any = {}, options: any = {}): Observable<T> {
    return this._httpClient.put(this.getApiEndpoint() + url, body, {
      observe: 'body',
      responseType: 'json',
      ...options
    }) as Observable<T>;
  }

  delete<T>(url: string, body = {}, options: any = {}): Observable<T> {
    return this._httpClient.delete(this.getApiEndpoint() + url, {
      observe: 'body',
      responseType: 'json',
      ...options,
      body
    }) as Observable<T>;
  }
}
