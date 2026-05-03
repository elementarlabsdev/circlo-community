import { Component, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { Location } from '@angular/common';
import { filter } from 'rxjs';
import {
  SidebarBody,
  Sidebar as NgsSidebar, SidebarHeader,
  SidebarNav,
  SidebarNavHeading,
  SidebarNavItem, SidebarNavItemIconDirective,
} from '@ngstarter-ui/components/sidebar';
import { TranslocoPipe } from '@jsverse/transloco';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Icon } from '@ngstarter-ui/components/icon';
import { AppStore } from '@store/app.store';
import { LogoComponent } from '@app/logo/logo.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    SidebarBody,
    NgsSidebar,
    SidebarNav,
    SidebarNavItem,
    SidebarNavHeading,
    TranslocoPipe,
    ScrollbarArea,
    Icon,
    SidebarNavItemIconDirective,
    LogoComponent,
    SidebarHeader,
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  router = inject(Router);
  location = inject(Location);
  appStore = inject(AppStore);
  height: string | null = '200px';

  navItems = signal([
    {
      key: 'main',
      type: 'link',
      name: 'admin.sidebar.dashboard',
      link: '/admin/dashboard',
      icon: 'fluent:home-24-regular'
    },
    // {
    //   key: 'analytics',
    //   type: 'link',
    //   name: 'admin.sidebar.analytics',
    //   link: '/admin/analytics',
    //   icon: 'fluent:chart-multiple-24-regular'
    // },
    // {
    //   key: 'activity',
    //   type: 'link',
    //   name: 'admin.sidebar.activity',
    //   link: '/admin/activity',
    //   icon: 'fluent:shifts-activity-24-regular'
    // },
    {
      key: 'heading1',
      name: 'admin.sidebar.content',
      type: 'heading',
    },
    {
      key: 'publications',
      name: 'admin.sidebar.publications',
      link: '/admin/publications',
      icon: 'fluent:textbox-24-regular',
      type: 'link',
    },
    {
      key: 'tutorials',
      name: 'admin.sidebar.tutorials',
      link: '/admin/tutorials',
      icon: 'fluent:video-24-regular',
      type: 'link',
    },
    {
      key: 'topics',
      type: 'link',
      name: 'admin.sidebar.topics',
      link: '/admin/topics',
      icon: 'fluent:compass-northwest-24-regular',
    },
    {
      key: 'channels',
      type: 'link',
      name: 'admin.sidebar.channels',
      link: '/admin/channels',
      icon: 'fluent:number-symbol-24-regular',
    },
    {
      key: 'comments',
      type: 'link',
      name: 'admin.sidebar.comments',
      link: '/admin/comments',
      icon: 'fluent:chat-24-regular',
    },
    {
      key: 'threads',
      type: 'link',
      name: 'admin.sidebar.threads',
      link: '/admin/threads',
      icon: 'fluent:chat-multiple-24-regular',
    },
    {
      key: 'heading2',
      name: 'admin.sidebar.management',
      type: 'heading',
    },
    {
      key: 'complaints',
      type: 'link',
      name: 'admin.sidebar.complaints',
      link: '/admin/complaints',
      icon: 'fluent:shield-error-24-regular',
    },
    {
      key: 'media',
      type: 'link',
      name: 'admin.sidebar.media',
      link: '/admin/media',
      icon: 'fluent:image-24-regular',
    },
    {
      key: 'roles',
      type: 'link',
      name: 'admin.sidebar.roles',
      link: '/admin/roles',
      icon: 'fluent:accessibility-24-regular',
    },
    {
      key: 'users',
      type: 'link',
      name: 'admin.sidebar.users',
      link: '/admin/users',
      icon: 'fluent:person-24-regular',
    },
    {
      key: 'pages',
      type: 'link',
      name: 'admin.sidebar.pages',
      link: '/admin/pages',
      icon: 'fluent:book-24-regular',
    },
    {
      key: 'menu',
      type: 'link',
      name: 'admin.sidebar.menu',
      link: '/admin/menus',
      icon: 'fluent:line-horizontal-3-24-regular',
    },
    {
      key: 'layout',
      type: 'link',
      name: 'admin.sidebar.layout',
      link: '/admin/layout',
      icon: 'fluent:window-24-regular',
    },
    {
      key: 'heading3',
      name: 'admin.sidebar.system',
      type: 'heading',
    },
    {
      key: 'monetization',
      type: 'link',
      name: 'admin.sidebar.monetization',
      link: '/admin/monetization',
      icon: 'fluent:money-24-regular',
    },
    {
      key: 'announcements',
      type: 'link',
      name: 'admin.sidebar.announcements',
      link: '/admin/announcements',
      icon: 'fluent:flash-24-regular',
    },
    {
      key: 'settings',
      type: 'link',
      name: 'admin.sidebar.settings',
      link: '/admin/settings',
      icon: 'fluent:settings-24-regular',
    }
  ]);
  activeLinkId = '';

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
