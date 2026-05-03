import { Component, inject, OnInit } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Location } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { Navigation, NavigationItem } from '@ngstarter-ui/components/navigation';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelContent, Panel, PanelSidebar } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';

export interface NavItem {
  name: string;
  link: string;
}

@Component({
  standalone: true,
  imports: [
    RouterLink,
    RouterOutlet,
    ReactiveFormsModule,
    Navigation,
    NavigationItem,
    TranslocoPipe,
    ScrollbarArea,
    Panel,
    PanelSidebar,
    PanelContent,
  ],
  templateUrl: './common.component.html',
  styleUrl: './common.component.scss'
})
export class CommonComponent implements OnInit {
  private _appStore = inject(AppStore);
  router = inject(Router);
  location = inject(Location);
  activeLinkId: string | null;
  navItems: NavItem[] = [
    {
      name: 'account.menu.myProfile',
      link: '/studio/account'
    },
    {
      name: 'account.menu.security',
      link: '/studio/account/security'
    },
    {
      name: 'account.menu.notifications',
      link: '/studio/account/notifications'
    },
    {
      name: 'account.menu.donations',
      link: '/studio/account/donations'
    },
    {
      name: 'account.menu.cookie',
      link: '/studio/account/cookie'
    },
    {
      name: 'account.menu.dangerZone',
      link: '/studio/account/danger-zone'
    }
  ];

  constructor() {
    this._appStore.setBreadcrumbs([
      {
        name: 'breadcrumbs.studio',
        link: '/studio'
      },
      {
        name: 'breadcrumbs.account'
      }
    ]);
  }

  ngOnInit() {
    this._activateLink();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._activateLink();
      })
    ;
  }

  private _activateLink(): void {
    const activeLink = this.navItems.find(
      navItem => navItem.link === this.location.path()
    );

    if (activeLink) {
      this.activeLinkId = activeLink.link;
    } else {
      this.activeLinkId = null;
    }
  }
}
