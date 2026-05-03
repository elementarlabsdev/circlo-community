import { Component, computed, inject } from '@angular/core';
import { AppStore } from '@store/app.store';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';

@Component({
  selector: 'app-login-guard',
  imports: [],
  templateUrl: './login-guard.component.html',
  styleUrl: './login-guard.component.scss',
  host: {
    '[class.is-not-logged]': '!isLogged()',
    '[inert]': '!isLogged() || null',
    '(mousedown)': 'onMouseDown($event)',
  }
})
export class LoginGuardComponent {
  private _appStore = inject(AppStore);
  private _snackbar = inject(SnackBar);

  isLogged = computed<boolean>(() => {
    return this._appStore.isLogged();
  });

  onMouseDown(event: MouseEvent) {
    if (!this._appStore.isLogged()) {
      event.stopPropagation();
      event.preventDefault();
      this._snackbar.open('Log in to continue', '', {
        verticalPosition: 'top',
        duration: 3000,
      });
      return;
    }
  }
}
