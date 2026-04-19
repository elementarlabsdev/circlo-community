import { Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { Dialog } from '@ngstarter/components/dialog';
import { GoogleAdsenseComponent } from '@/admin/settings/_ads/google-adsense/google-adsense.component';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardActions, CardContent, CardTitle } from '@ngstarter/components/card';
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
  templateUrl: './ads.component.html',
  styleUrl: './ads.component.scss'
})
export class AdsComponent {
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _dialog = inject(Dialog);
  private _translateService = inject(TranslateService);

  adsProviders = signal<any[]>([]);
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
        id: 'ads',
        name: 'breadcrumbs.settings.adsense',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/ads')
      .subscribe((res: any) => {
        this.adsProviders.set(res.adsProviders);
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
      case 'googleAdsense':
        dialogComponent = GoogleAdsenseComponent;
        break;
      default:
        dialogComponent = null;
    }

    if (!dialogComponent) {
      return;
    }

    const dialogRef = this._dialog.open(dialogComponent, {data: provider.config || provider, width: '800px'});
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.isConfigured) {
        const payload = {type: provider.type, isEnabled: result.isEnabled ?? true, config: result.formData} as any;
        this._api.post('admin/settings/ads/provider/update', payload).subscribe({
          next: (res: any) => {
            const saved = res?.provider || {};
            const updated = this.adsProviders().map((p) =>
              p.type === provider.type
                ? {...p, ...saved}
                : p,
            );
            this.adsProviders.set(updated);
            this._snackBar.open(this._translateService.instant('admin.settings.ads.saved'), '', {
              verticalPosition: 'top',
              duration: 2000
            });
          },
          error: () => {
            this._snackBar.open(this._translateService.instant('admin.settings.ads.failed'), '', {
              verticalPosition: 'top',
              duration: 3000
            });
          }
        });
      }
    });
  }
}
