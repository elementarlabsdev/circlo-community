import { Component, computed, inject, signal } from '@angular/core';
import { Icon } from '@ngstarter-ui/components/icon';
import { Button } from '@ngstarter-ui/components/button';
import { Badge } from '@ngstarter-ui/components/badge';
import { Menu, MenuDivider, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { Divider } from '@ngstarter-ui/components/divider';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Router, RouterLink } from '@angular/router';
import { AssistantSearchComponent } from '@app/header/_assistant-search/assistant-search.component';
import { SafeHtmlPipe, SoundEffectDirective } from '@ngstarter-ui/components/core';
import { AuthService } from '@services/auth.service';
import { LogoComponent } from '@app/logo/logo.component';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { LoginDto } from '@model/interfaces';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import {
  ColorScheme,
  ColorSchemeDarkDirective,
  ColorSchemeLightDirective,
  ColorSchemeSwitcher
} from '@ngstarter-ui/components/color-scheme';
import { Announcement } from '@ngstarter-ui/components/announcement';
import { ActionManager } from '@services/action-manager';
import { CanDirective } from '@directives/can.directive';

import { Dialog } from '@ngstarter-ui/components/dialog';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { MobileMenuDialogComponent } from '@modals/mobile-menu-dialog/mobile-menu-dialog.component';
import { SearchDialogComponent } from '@modals/search-dialog/search-dialog.component';
import { HeaderActionsDialogComponent } from '@modals/header-actions-dialog/header-actions-dialog.component';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-header',
  imports: [
    Icon,
    Badge,
    Menu,
    MenuTrigger,
    MenuItem,
    Divider,
    Button,
    Tooltip,
    RouterLink,
    AssistantSearchComponent,
    SoundEffectDirective,
    LogoComponent,
    Dicebear,
    ImageProxyPipe,
    Icon,
    TranslocoPipe,
    ColorSchemeDarkDirective,
    ColorSchemeLightDirective,
    ColorSchemeSwitcher,
    Announcement,
    SafeHtmlPipe,
    MenuDivider,
    CanDirective
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  host: {
    'class': 'block w-full h-full'
  }
})
export class HeaderComponent {
  protected _apiService = inject(ApiService);
  protected actionManager = inject(ActionManager);
  private _appStore = inject(AppStore);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _settingsService = inject(SettingsService);
  private _ability = inject(Ability);

  loading = signal(false);
  profile = computed(() => {
    return this._appStore.profile() as LoginDto;
  });
  isAdmin = computed(() => this._ability.can(Action.Manage, 'all'));

  contentAllowThreads = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowThreads')());
  contentAllowPublications = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowPublications')());
  contentAllowTutorials = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowTutorials')());

  isRegistrationEnabled = computed(() => {
    return this._appStore.isRegistrationEnabled();
  });
  monetizationCreditsEnabled = computed(() => {
    return this._appStore.monetizationCreditsEnabled();
  });
  unreadNotificationsCount = computed(() => {
    return this._appStore.unreadNotificationsCount();
  });
  announcement = computed(() => {
    return this._appStore.announcement();
  });
  variant = computed(() => {
    const announcement = this.announcement();

    if (!announcement) {
      return 'neutral';
    }

    const type = announcement.type;

    if (type === 'success') {
      return 'positive';
    }

    if (type === 'warning') {
      return 'warning';
    }

    if (type === 'critical') {
      return 'negative';
    }

    if (type === 'info') {
      return 'informative';
    }

    return 'neutral';
  });

  createThread() {
    this.actionManager.action.emit({
      action: 'addThread',
      payload: null
    });
  }

  createPublication(): void {
    this._apiService
      .post('studio/publication/new')
      .subscribe((res: any) => {
        this._router.navigateByUrl(`/studio/publications/edit/${res.publication.hash}/content`);
      });
  }

  createTutorial(): void {
    this._apiService
      .post('studio/tutorials')
      .subscribe((res: any) => {
        this._router.navigateByUrl(`/studio/tutorials/${res.tutorial.id}/content`);
      });
  }

  logout(): void {
    this._authService.logout();
  }

  onColorSchemeChanged(colorScheme: ColorScheme) {
    if (!this._authService.isLogged()) {
      return;
    }

    this._apiService.post('studio/account/color-scheme', {
      colorScheme
    }).subscribe((res: any) => {});
  }

  protected dialog = inject(Dialog);

  openMobileMenu() {
    this.dialog.open(MobileMenuDialogComponent, {
      width: '100vw',
      height: '100vh',
      maxWidth: '100vw',
      maxHeight: '100vh',
      panelClass: 'mobile-menu-panel'
    });
  }

  openSearch() {
    this.dialog.open(SearchDialogComponent, {
      width: '100vw',
      maxWidth: '600px',
      panelClass: 'search-dialog-panel'
    });
  }

  openActions() {
    this.dialog.open(HeaderActionsDialogComponent, {
      width: '100vw',
      maxWidth: '100vw',
      panelClass: ['header-actions-panel', 'm-0', 'p-0']
    });
  }

  redirectToTarget() {
    if (this.announcement().targetUrl) {
      window.open(this.announcement().targetUrl, '_blank');
    }
  }

  onAnnouncementClosed() {
    const announcementId = this.announcement().id;
    this._appStore.setAnnouncement(null);

    if (this._appStore.isLogged()) {
      this._apiService
        .post(`announcements/${announcementId}/dismiss`)
        .subscribe();
    }
  }
}
