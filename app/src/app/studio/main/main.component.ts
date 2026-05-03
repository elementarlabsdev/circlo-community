import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { Component, computed, inject, model, signal } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { Sidebar } from '../@studio/sidebar/sidebar.component';
import {
  LayoutApiService,
  LayoutContent,
  Layout,
  LayoutTopbar
} from '@ngstarter-ui/components/layout';
import { Icon } from '@ngstarter-ui/components/icon';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter-ui/components/sidenav';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Announcement } from '@ngstarter-ui/components/announcement';
import {
  BreadcrumbItemIconDefDirective,
  BreadcrumbItemNameDefDirective,
  BreadcrumbsGlobal
} from '@ngstarter-ui/components/breadcrumbs';
import { Button } from '@ngstarter-ui/components/button';
import {
  ColorScheme, ColorSchemeDarkDirective,
  ColorSchemeLightDirective,
  ColorSchemeSwitcher
} from '@ngstarter-ui/components/color-scheme';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { Menu, MenuDivider, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { SafeHtmlPipe, SoundEffectDirective } from '@ngstarter-ui/components/core';
import { TranslocoPipe } from '@jsverse/transloco';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { AuthService } from '@services/auth.service';
import { LoginDto } from '@model/interfaces';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Badge } from '@ngstarter-ui/components/badge';
import { ActionManager } from '@services/action-manager';
import { Divider } from '@ngstarter-ui/components/divider';
import { Toolbar, ToolbarSpacer } from '@ngstarter-ui/components/toolbar';
import { SettingsService } from '@services/settings.service';
import { CanDirective } from '@directives/can.directive';

@Component({
  imports: [
    RouterOutlet,
    Sidebar,
    Layout,
    LayoutContent,
    LayoutTopbar,
    Sidenav,
    SidenavContainer,
    SidenavContent,
    Icon,
    Panel,
    PanelHeader,
    PanelContent,
    Announcement,
    BreadcrumbItemIconDefDirective,
    BreadcrumbItemNameDefDirective,
    BreadcrumbsGlobal,
    Button,
    ColorSchemeSwitcher,
    Dicebear,
    ImageProxyPipe,
    Menu,
    MenuDivider,
    MenuItem,
    RouterLink,
    SoundEffectDirective,
    TranslocoPipe,
    SafeHtmlPipe,
    MenuTrigger,
    Tooltip,
    ColorSchemeLightDirective,
    ColorSchemeDarkDirective,
    Badge,
    Divider,
    Toolbar,
    ToolbarSpacer,
    CanDirective,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainComponent {
  protected actionManager = inject(ActionManager);
  private _layoutApi = inject(LayoutApiService);
  protected _apiService = inject(ApiService);
  private _appStore = inject(AppStore);
  private _authService = inject(AuthService);
  private _router = inject(Router);
  private _settingsService = inject(SettingsService);
  private _ability = inject(Ability);

  profile = computed(() => {
    return this._appStore.profile() as LoginDto;
  });
  isAdmin = computed(() => this._ability.can(Action.Manage, 'all'));

  contentAllowThreads = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowThreads')());
  contentAllowPublications = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowPublications')());
  contentAllowTutorials = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowTutorials')());

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

  monetizationCreditsEnabled = computed(() => {
    return this._appStore.monetizationCreditsEnabled();
  });

  title = '';

  ngOnInit() {
  }

  get preferredColorScheme(): string {
    return this.profile()?.preferredColorScheme;
  }

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
      })
    ;
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

  redirectToTarget() {
    if (this.announcement().targetUrl) {
      window.open(this.announcement().targetUrl, '_blank');
    }
  }

  onAnnouncementClosed() {
    const announcementId = this.announcement().id;
    this._appStore.setAnnouncement(null);
    this._apiService
      .post(`announcements/${announcementId}/dismiss`)
      .subscribe();
  }

  sidebarExpanded = model(true);
  opened = model(true);

  get isSidebarShown() {
    return this._layoutApi.isSidebarShown('root');
  }

  toggleSidebar(): void {
    this._layoutApi.toggleSidebar('root');
    localStorage.setItem('sidebarVisibility', this._layoutApi.isSidebarShown('root') ? 'true' : 'false');
  }
}
