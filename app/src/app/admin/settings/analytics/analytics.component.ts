import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { Button } from '@ngstarter-ui/components/button';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { Dialog } from '@ngstarter-ui/components/dialog';
import {
  GoogleAnalyticsComponent
} from '@/admin/settings/_analytics-provider/google-analytics/google-analytics.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardActions, CardContent, CardTitle } from '@ngstarter-ui/components/card';
import { TranslateService } from '@services/translate.service';

@Component({
  imports: [
    ReactiveFormsModule,
    Button,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    Button,
    CardActions,
    CardContent,
    CardTitle,
    Card,
  ],
  templateUrl: './analytics.component.html',
  styleUrl: './analytics.component.scss'
})
export class AnalyticsComponent {
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _dialog = inject(Dialog);
  private _translateService = inject(TranslateService);

  analyticsProviders = signal<any[]>([]);
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
        id: 'admin',
        route: '/admin',
        name: 'breadcrumbs.admin',
        type: 'link'
      },
      {
        id: 'admin',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'analytics',
        name: 'breadcrumbs.settings.analytics',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/analytics')
      .subscribe((res: any) => {
        this.analyticsProviders.set(res.analyticsProviders);
        this.loaded.set(true);
      });
  }

  configure(provider: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    let dialogComponent: any = null;
    switch (provider.type) {
      case 'googleAnalytics':
        dialogComponent = GoogleAnalyticsComponent;
        break;
      default:
        dialogComponent = null;
    }

    if (!dialogComponent) {
      return;
    }

    const dialogRef = this._dialog.open(dialogComponent, {
      data: provider.config,
      width: '460px'
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.isConfigured) {
        const payload = {type: provider.type, isEnabled: result.isEnabled ?? true, config: result.formData} as any;
        this._api.post('admin/settings/analytics/provider/update', payload).subscribe({
          next: (res: any) => {
            const saved = res?.provider || {};
            const updated = this.analyticsProviders().map((p) =>
              p.type === provider.type
                ? {...p, ...saved}
                : p,
            );
            this.analyticsProviders.set(updated);
            this._snackBar.open(this._translateService.instant('admin.settings.analytics.saved'), '', {
              verticalPosition: 'top',
              duration: 2000
            });
          },
          error: () => {
            this._snackBar.open(this._translateService.instant('admin.settings.analytics.failed'), '', {
              verticalPosition: 'top',
              duration: 3000
            });
          }
        });
      }
    });
  }
}
