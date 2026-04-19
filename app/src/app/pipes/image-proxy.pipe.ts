import { inject, Pipe, PipeTransform } from '@angular/core';
import { AppStore } from '@store/app.store';
import { ImageProxyService } from '@services/image-proxy.service';

@Pipe({
  standalone: true,
  name: 'imageProxy'
})
export class ImageProxyPipe implements PipeTransform {
  private _appStore = inject(AppStore);
  private imageProxyService = inject(ImageProxyService);

  transform(url: any, options = ''): string {
    if (!url) {
      return '';
    }

    if (url.startsWith('data:image')) {
      return url;
    }

    if (url.startsWith('http://localhost')) {
      return url;
    }

    return this.imageProxyService.transform(url, options);
  }
}
