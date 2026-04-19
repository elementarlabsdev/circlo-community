import { inject, Pipe, PipeTransform } from '@angular/core';
import { AppStore } from '@store/app.store';
import { NavItem } from '@model/interfaces';

@Pipe({
  name: 'authorizedOnly',
  standalone: true
})
export class AuthorizedOnlyPipe implements PipeTransform {
  private _appStore = inject(AppStore);

  transform(items: NavItem[]): NavItem[] {
    return items.filter(item => {
      if (this._appStore.isLogged()) {
        return true;
      }

      return !item.authorisedOnly;
    });
  }
}
