import { inject, Injectable } from '@angular/core';
import { AppStore } from '@store/app.store';

@Injectable({
  providedIn: 'root'
})
export class ImageProxyService {
  private _appStore = inject(AppStore);

  transform(url: any, options = ''): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('data:image')) {
      return url;
    }

    let imageProxyUrl = this._appStore.imageProxyUrl();
    const urlDomain = this.getDomainOfUrl(url);
    const imgProxyDomain = this.getDomainOfUrl(imageProxyUrl);

    if (urlDomain === imgProxyDomain) {
      url = new URL(url).pathname.substring(1);
    }

    if (!options) {
      return `${imageProxyUrl}/${url}`;
    }

    return `${imageProxyUrl}/${options}/${url}`;
  }

  private getDomainOfUrl(url: string): string {
    try {
      const hostname = new URL(url).hostname;
      const parts = hostname.split('.');
      if (parts.length > 2) {
        return parts.slice(-2).join('.');
      }
      return hostname;
    } catch (e) {
      return '';
    }
  }
}
