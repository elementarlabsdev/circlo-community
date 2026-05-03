import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoPipe } from '@jsverse/transloco';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Icon } from '@ngstarter-ui/components/icon';

import { Action, AbilityService } from '@services/ability.service';
import { CanDirective } from '@directives/can.directive';

@Component({
  selector: 'app-stripe',
  standalone: true,
  imports: [
    Button,
    TranslocoPipe,
    Panel,
    PanelContent,
    PanelHeader,
    ScrollbarArea,
    Icon,
    CanDirective
  ],
  templateUrl: './stripe.html',
  styleUrl: './stripe.scss',
})
export class Stripe implements OnInit {
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  protected readonly Action = Action;

  stripeAccountStatus = signal<string | null>(null);
  loaded = signal(false);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.account',
        id: 'account',
        type: 'link',
        route: '/studio/account',
      },
      {
        name: 'breadcrumbs.account.stripe',
        id: 'stripe',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this._api
      .get('studio/account/my-profile')
      .subscribe((profile: any) => {
        this.stripeAccountStatus.set(profile.stripeAccountStatus);
        this.loaded.set(true);

        if (profile.stripeAccountStatus === 'onboarding') {
          this.refreshStatus();
        }
      })
    ;
  }

  refreshStatus() {
    this._api.post('payments/connect/refresh-status').subscribe({
      next: (res: any) => {
        if (res.status) {
          this.stripeAccountStatus.set(res.status);
        }
      }
    });
  }

  connect(): void {
    this._api.post('payments/connect/onboarding').subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this._snackBar.open('Error starting onboarding', 'Close', { duration: 3000 });
      }
    });
  }

  openDashboard(): void {
    this._api.post('payments/connect/dashboard').subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this._snackBar.open('Error opening dashboard', 'Close', { duration: 3000 });
      }
    });
  }

  disconnect(): void {
    if (confirm('Are you sure you want to disconnect your Stripe account?')) {
      this._api.post('payments/connect/disconnect').subscribe({
        next: () => {
          this.stripeAccountStatus.set(null);
          this._snackBar.open('Stripe account disconnected', 'Close', { duration: 3000 });
        },
        error: (err: any) => {
          this._snackBar.open('Error disconnecting Stripe account', 'Close', { duration: 3000 });
        }
      });
    }
  }
}
