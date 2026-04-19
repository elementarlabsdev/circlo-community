import { Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { AppStore } from '@store/app.store';
import { Dialog } from '@ngstarter/components/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import {
  PanelContent,
  Panel,
  PanelHeader,
} from '@ngstarter/components/panel';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import {
  Card,
  CardActions,
  CardContent,
  CardTitle,
} from '@ngstarter/components/card';
import { GoogleRecaptchaComponent } from '@/admin/settings/_captcha-provider/google-recaptcha/google-recaptcha.component';
import { LocalCaptchaComponent } from '@/admin/settings/_captcha-provider/local-captcha/local-captcha.component';

@Component({
  selector: 'app-captcha',
  standalone: true,
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
  templateUrl: './captcha.html',
  styleUrl: './captcha.scss',
})
export class Captcha {
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _dialog = inject(Dialog);
  private _translocoService = inject(TranslocoService);

  captchaProviders = signal<any[]>([]);
  loaded = signal(false);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular',
      },
      {
        id: 'admin',
        route: '/admin',
        name: 'breadcrumbs.admin',
        type: 'link',
      },
      {
        id: 'admin',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link',
      },
      {
        id: 'captcha',
        name: 'breadcrumbs.settings.captcha',
        type: null,
      },
    ]);
  }

  ngOnInit() {
    this._api.get('admin/settings/captcha').subscribe((res: any) => {
      this.captchaProviders.set(res.captchaProviders);
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
      case 'recaptcha':
        dialogComponent = GoogleRecaptchaComponent;
        break;
      case 'local':
        dialogComponent = LocalCaptchaComponent;
        break;
      default:
        dialogComponent = null;
    }

    if (!dialogComponent) {
      return;
    }

    const dialogRef = this._dialog.open(dialogComponent, {
      data: provider,
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.isConfigured) {
        const payload = {
          type: provider.type,
          ...result.formData,
        } as any;
        this._api
          .post('admin/settings/captcha/provider/update', payload)
          .subscribe({
            next: (res: any) => {
              const saved = res?.provider || {};
              const updated = this.captchaProviders().map((p) =>
                p.type === provider.type ? { ...p, ...saved } : p,
              );
              this.captchaProviders.set(updated);
              this._snackBar.open(this._translocoService.translate('admin.settings.captcha.save-success'), '', {
                verticalPosition: 'top',
                duration: 2000,
              });
            },
            error: () => {
              this._snackBar.open(this._translocoService.translate('admin.settings.captcha.save-error'), '', {
                verticalPosition: 'top',
                duration: 3000,
              });
            },
          });
      }
    });
  }

  makeDefault(provider: any, event: Event) {
    event.stopPropagation();
    event.preventDefault();
    this._api
      .post('admin/settings/captcha/provider/default', { type: provider.type })
      .subscribe({
        next: () => {
          const updated = this.captchaProviders().map((p) => ({
            ...p,
            isDefault: p.type === provider.type,
          }));
          this.captchaProviders.set(updated);
          this._snackBar.open(this._translocoService.translate('admin.settings.captcha.update-success'), '', {
            verticalPosition: 'top',
            duration: 2000,
          });
        },
        error: () => {
          this._snackBar.open(this._translocoService.translate('admin.settings.captcha.update-error'), '', {
            verticalPosition: 'top',
            duration: 3000,
          });
        },
      });
  }
}
