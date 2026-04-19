import { ChangeDetectorRef, Component, inject, OnInit, viewChild } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { Location } from '@angular/common';
import { ApiService } from '@services/api.service';
import { AuthorizedOnlyPipe } from '@app/sidebar/authorized-only.pipe';
import { AuthService } from '@services/auth.service';
import { OrderByPipe } from '@ngstarter/components/core';
import { Icon } from '@ngstarter/components/icon';
import { NavItem, SocialMediaLink } from '@model/interfaces';
import { AppStore } from '@store/app.store';
import {
  Navigation,
  NavigationGroup,
  NavigationGroupMenu,
  NavigationGroupToggle, NavigationHeading,
  NavigationItem, NavigationItemIconDirective
} from '@ngstarter/components/navigation';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { LayoutSlotComponent } from '@app/layout-slot/layout-slot.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    RouterLink,
    OrderByPipe,
    Icon,
    AuthorizedOnlyPipe,
    NavigationGroupToggle,
    NavigationItem,
    NavigationGroupMenu,
    NavigationGroup,
    NavigationHeading,
    Navigation,
    NavigationItemIconDirective,
    ImageProxyPipe,
    LayoutSlotComponent,
    TranslocoPipe
  ],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class Sidebar implements OnInit {
  private _apiService = inject(ApiService);
  private _appStore = inject(AppStore);
  private _authService = inject(AuthService);
  private _cdr = inject(ChangeDetectorRef);
  router = inject(Router);
  location = inject(Location);
  height: string | null = '200px';
  loading = true;

  navigation = viewChild('navigation');

  mainItems: NavItem[] = [];
  navItemLinks: NavItem[] = [];
  footerItems: NavItem[] = [];
  socialMediaLinks: SocialMediaLink[] = this._appStore.socialMediaLinks();
  activeLinkId: any = '/';

  ngOnInit() {
    this._apiService
      .get('menus-for-sidebar')
      .subscribe((res: any) => {
        this.mainItems = res.main.items;
        this.footerItems = res.footer.items;
        this.mainItems.forEach(navItem => {
          this.navItemLinks.push(navItem);

          if (navItem.children) {
            this.navItemLinks = this.navItemLinks.concat(navItem.children as NavItem[]);
          }
        });
        this._activateLink();
        this.loading = false;
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
    this._authService.loggedChange.subscribe(res => {
      this.mainItems = [...this.mainItems]; // rebuild menu items
      this._cdr.detectChanges();
    });
  }

  private _activateLink() {
    const activeLink = this.navItemLinks.find(
      navItem => navItem.url === this.location.path()
    );

    if (activeLink) {
      this.activeLinkId = activeLink.url;
    } else {
      if (!this.location.path()) {
        this.activeLinkId = '/';
      }
    }
  }
}
