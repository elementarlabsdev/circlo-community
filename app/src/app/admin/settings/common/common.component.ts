import { Component, inject } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import { NavItem } from '@model/interfaces';
import { Navigation, NavigationItem } from '@ngstarter/components/navigation';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { Sidenav, SidenavContainer, SidenavContent } from '@ngstarter/components/sidenav';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';

@Component({
  imports: [
    RouterOutlet,
    RouterLink,
    NavigationItem,
    Navigation,
    ScrollbarArea,
    TranslocoPipe,
    SidenavContainer,
    Sidenav,
    SidenavContent,
    Button,
    Icon,
  ],
  templateUrl: './common.component.html',
  styleUrl: './common.component.scss'
})
export class CommonComponent {
  router = inject(Router);
  location = inject(Location);
  activeLinkId: string | null;
  navItems: NavItem[] = [
    {
      id: 'general',
      name: 'admin.settings.general-settings-heading',
      url: '/admin/settings',
      type: 'item',
    },
    {
      id: 'identity',
      name: 'admin.settings.identity-heading',
      url: '/admin/settings/identity',
      type: 'item',
    },
    {
      id: 'security',
      name: 'admin.settings.security-heading',
      url: '/admin/settings/security',
      type: 'item',
    },
    {
      id: 'branding',
      name: 'admin.settings.branding-heading',
      url: '/admin/settings/branding',
      type: 'item',
    },
    {
      id: 'reading',
      name: 'admin.settings.reading-heading',
      url: '/admin/settings/reading',
      type: 'item',
    },
    {
      id: 'content',
      name: 'admin.settings.content-heading',
      url: '/admin/settings/content',
      type: 'item',
    },
    {
      id: 'discussion',
      name: 'admin.settings.discussion-heading',
      url: '/admin/settings/discussion',
      type: 'item',
    },
    {
      id: 'social-media-links',
      name: 'admin.settings.social-media-links-heading',
      url: '/admin/settings/social-media-links',
      type: 'item',
    },
    {
      id: 'mail',
      name: 'admin.settings.mail-heading',
      url: '/admin/settings/mail',
      type: 'item',
    },
    {
      id: 'fileStorage',
      name: 'admin.settings.file-storage-providers-heading',
      url: '/admin/settings/file-storage',
      type: 'item',
    },
    {
      id: 'analytics',
      name: 'admin.settings.analytics-heading',
      url: '/admin/settings/analytics',
      type: 'item',
    },
    {
      id: 'cookieConsent',
      name: 'admin.settings.cookieConsent',
      url: '/admin/settings/cookie-consent',
      type: 'item',
    },
    {
      id: 'captcha',
      name: 'admin.settings.captcha',
      url: '/admin/settings/captcha',
      type: 'item',
    },
    {
      id: 'ads',
      name: 'admin.settings.advertisement-heading',
      url: '/admin/settings/ads',
      type: 'item',
    },
    {
      id: 'search-engine-crawlers',
      name: 'admin.settings.search-engine-crawlers-heading',
      url: '/admin/settings/search-engine-crawlers',
      type: 'item',
    },
    {
      id: 'meta-tags',
      name: 'admin.settings.meta-tags',
      url: '/admin/settings/meta-tags',
      type: 'item',
    },
    {
      id: 'license-key',
      name: 'admin.settings.license-key',
      url: '/admin/settings/license-key',
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
      })
    ;
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
