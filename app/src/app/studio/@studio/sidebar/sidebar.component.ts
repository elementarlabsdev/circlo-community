import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';
import { Component, computed, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import { ApiService } from '@services/api.service';
import {
  SidebarBody,
  Sidebar as NgsSidebar, SidebarFooter, SidebarHeader,
  SidebarNav,
  SidebarNavHeading,
  SidebarNavItem, SidebarNavItemIconDirective,
} from '@ngstarter/components/sidebar';
import { LayoutApiService } from '@ngstarter/components/layout';
import { NavigationItem } from '@ngstarter/components/navigation';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Icon } from '@ngstarter/components/icon';
import { LogoComponent } from '@app/logo/logo.component';
import { AppStore } from '@store/app.store';
import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    SidebarNav,
    SidebarBody,
    NgsSidebar,
    SidebarNavHeading,
    SidebarNavItem,
    TranslocoPipe,
    ScrollbarArea,
    Icon,
    SidebarNavItemIconDirective,
    SidebarHeader,
    LogoComponent
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class Sidebar {
  router = inject(Router);
  location = inject(Location);
  private _api= inject(ApiService);
  private _layoutApi= inject(LayoutApiService);
  private _appStore = inject(AppStore);
  private _settingsService = inject(SettingsService);
  private _ability = inject(Ability);

  height: string | null = '200px';

  monetizationCreditsEnabled = computed(() => this._appStore.monetizationCreditsEnabled());
  isPaid = computed(() => this._appStore.profile()?.hasPaidAccount ?? false);
  isAdmin = computed(() => this._ability.can(Action.Manage, 'all'));

  contentAllowPublications = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowPublications')());
  contentAllowTutorials = computed(() => this.isAdmin() || this._settingsService.setting('contentAllowTutorials')());

  navItems = computed(() => {
    return [
      {
        key: 'main',
        type: 'link',
        name: 'studio.menu.dashboard',
        link: '/studio/dashboard',
        icon: 'fluent:home-24-regular'
      },
      ...(this.contentAllowPublications() ? [{
        key: 'publications',
        type: 'link',
        name: 'studio.menu.publications',
        link: '/studio/publications/list',
        icon: 'fluent:textbox-24-regular'
      }] : []),
      ...(this.contentAllowTutorials() ? [{
        key: 'tutorials',
        type: 'link',
        name: 'studio.menu.tutorials',
        link: '/studio/tutorials/list',
        icon: 'fluent:video-24-regular'
      }] : []),
      {
        key: 'notifications',
        type: 'link',
        name: 'studio.menu.notifications',
        link: '/studio/notifications',
        icon: 'fluent:alert-24-regular'
      },
      {
        key: 'followers',
        type: 'link',
        name: 'studio.menu.followers',
        link: '/studio/followers',
        icon: 'fluent:person-24-regular'
      },
      {
        key: 'media',
        type: 'link',
        name: 'studio.menu.media',
        link: '/studio/media',
        icon: 'fluent:image-24-regular'
      },
      {
        key: 'channels',
        type: 'link',
        name: 'studio.menu.channels',
        link: '/studio/channels',
        icon: 'fluent:box-24-regular'
      },
      {
        key: 'image-designer',
        type: 'link',
        name: 'studio.menu.image-designer',
        link: '/studio/image-designer',
        icon: 'fluent:layer-24-regular'
      },
      {
        key: 'account',
        type: 'link',
        name: 'studio.menu.account',
        link: '/studio/account',
        icon: 'fluent:person-24-regular'
      },
      ...(this.monetizationCreditsEnabled() ? [{
        key: 'credits',
        type: 'link',
        name: 'studio.menu.credits',
        link: '/studio/credits',
        icon: 'fluent:money-hand-24-regular'
      }] : []),
      ...(this.isPaid() ? [{
        key: 'subscription',
        type: 'link',
        name: 'studio.menu.subscription',
        link: '/studio/subscription',
        icon: 'fluent:person-money-24-regular'
      }] : []),
    ];
  });
  navItemLinks: any[] = [];
  activeLinkId: any = '';
  footerLinks: any[] = [];

  ngOnInit() {
    this._api
      .get('menus-for-sidebar')
      .subscribe((res: any) => {
        this.footerLinks = res.footer.items;
        this._activateLink();
      })
    ;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._activateLink();
      })
    ;
  }

  toggleSidebar(): void {
    this._layoutApi.toggleSidebar('root');
  }

  private _activateLink() {
    const activeLink = this.navItems().find(
      navItem => {
        if (navItem.link === this.location.path()) {
          return true;
        }

        return this.location.path().includes(navItem.link as string);
      }
    );

    if (activeLink) {
      this.activeLinkId = activeLink.key;
    } else {
      if (!this.location.path()) {
        this.activeLinkId = '';
      }
    }
  }
}
