import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { Component, computed, inject } from '@angular/core';
import { DIALOG_DATA, DialogContent, DialogRef } from '@ngstarter/components/dialog';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Router, RouterLink } from '@angular/router';
import { AppStore } from '@store/app.store';
import { LoginDto } from '@model/interfaces';
import { CanDirective } from '@directives/can.directive';
import { TranslocoPipe } from '@jsverse/transloco';
import { ColorScheme, ColorSchemeDarkDirective, ColorSchemeLightDirective, ColorSchemeSwitcher } from '@ngstarter/components/color-scheme';
import { SoundEffectDirective } from '@ngstarter/components/core';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { ActionManager } from '@services/action-manager';
import { Divider } from '@ngstarter/components/divider';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-header-actions-dialog',
  standalone: true,
  imports: [
    DialogContent,
    Button,
    Icon,
    RouterLink,
    CanDirective,
    TranslocoPipe,
    ColorSchemeSwitcher,
    ColorSchemeLightDirective,
    ColorSchemeDarkDirective,
    SoundEffectDirective,
    Divider
  ],
  templateUrl: './header-actions-dialog.component.html',
  styleUrl: './header-actions-dialog.component.scss'
})
export class HeaderActionsDialogComponent {
  private dialogRef = inject(DialogRef);
  private _appStore = inject(AppStore);
  private _apiService = inject(ApiService);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private actionManager = inject(ActionManager);
  private _settingsService = inject(SettingsService);
  private _ability = inject(Ability);

  profile = computed(() => this._appStore.profile() as LoginDto);
  isAdmin = computed(() => this._ability.can(Action.Manage, 'all'));

  contentAllowThreads = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowThreads')());
  contentAllowPublications = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowPublications')());
  contentAllowTutorials = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowTutorials')());

  isRegistrationEnabled = computed(() => this._appStore.isRegistrationEnabled());
  monetizationCreditsEnabled = computed(() => this._appStore.monetizationCreditsEnabled());
  unreadNotificationsCount = computed(() => this._appStore.unreadNotificationsCount());

  close() {
    this.dialogRef.close();
  }

  createThread() {
    this.actionManager.action.emit({ action: 'addThread', payload: null });
    this.close();
  }

  createPublication() {
    this._apiService.post('studio/publication/new').subscribe((res: any) => {
      this._router.navigateByUrl(`/studio/publications/edit/${res.publication.hash}`);
      this.close();
    });
  }

  createTutorial() {
    this._apiService.post('studio/tutorials').subscribe((res: any) => {
      this._router.navigateByUrl(`/studio/tutorials/${res.tutorial.id}/overview`);
      this.close();
    });
  }

  onColorSchemeChanged(colorScheme: ColorScheme) {
    if (!this._authService.isLogged()) {
      return;
    }

    this._apiService.post('studio/account/color-scheme', { colorScheme }).subscribe();
  }
}
