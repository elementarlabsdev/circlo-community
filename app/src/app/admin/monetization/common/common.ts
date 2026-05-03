import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Navigation, NavigationItem } from '@ngstarter-ui/components/navigation';
import { Panel, PanelContent, PanelSidebar } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { Location } from '@angular/common';
import { NavItem } from '@model/interfaces';
import { filter } from 'rxjs';

@Component({
  imports: [
    RouterOutlet,
    Navigation,
    NavigationItem,
    Panel,
    PanelContent,
    PanelSidebar,
    ScrollbarArea,
    TranslocoPipe,
    RouterLink
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
})
export class Common {
  router = inject(Router);
  location = inject(Location);
  activeLinkId: string | null;
  navItems: NavItem[] = [
    {
      id: 'overview',
      name: 'admin.monetization.overview',
      url: '/admin/monetization',
      type: 'item',
    },
    {
      id: 'stripe',
      name: 'admin.monetization.stripe',
      url: '/admin/monetization/stripe',
      type: 'item',
    },
    {
      id: 'paid-account',
      name: 'admin.monetization.paid-account',
      url: '/admin/monetization/paid-account',
      type: 'item',
    },
    {
      id: 'credits',
      name: 'admin.monetization.credits',
      url: '/admin/monetization/credits',
      type: 'item',
    },
    {
      id: 'transactions',
      name: 'admin.monetization.transactions',
      url: '/admin/monetization/transactions',
      type: 'item',
    },
  ];

  ngOnInit() {
    this._activateLink();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd)
      )
      .subscribe(() => {
        this._activateLink();
      });
  }

  private _activateLink(): void {
    const activeLink = this.navItems.find(
      navItem => navItem.url === this.location.path()
    );

    if (activeLink) {
      this.activeLinkId = activeLink.url;
    } else {
      this.activeLinkId = null;
    }
  }
}
