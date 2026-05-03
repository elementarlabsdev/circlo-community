import { inject, Pipe, PipeTransform } from '@angular/core';
import { EnvironmentService } from '@ngstarter-ui/components/core';

@Pipe({
  name: 'mediaItemUrl',
  standalone: true
})
export class MediaItemUrlPipe implements PipeTransform {
  private _envService = inject(EnvironmentService);

  transform(relativeUrl: string): string {
    return `${this._envService.getValue('apiUrl')}${relativeUrl}`;
  }
}
