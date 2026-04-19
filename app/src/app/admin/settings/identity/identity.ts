import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { TranslateService } from '@services/translate.service';
import { Dialog } from '@ngstarter/components/dialog';
import { GithubOauthProviderComponent } from '@/admin/settings/_oauth-provider/github/github-provider.component';
import { GoogleOauthProviderComponent } from '@/admin/settings/_oauth-provider/google/google-provider.component';
import { FacebookOauthProviderComponent } from '@/admin/settings/_oauth-provider/facebook/facebook-provider.component';
import { XOauthProviderComponent } from '@/admin/settings/_oauth-provider/x/x-provider.component';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { Icon } from '@ngstarter/components/icon';
import { Card, CardActions, CardContent, CardTitle } from '@ngstarter/components/card';

interface IdentitySettings {
  isPublicCommunity: boolean;
  registrationEnabled: boolean;
  oAuthEnabled: boolean;
  oAuthProviders: any[];
}

@Component({
  imports: [
    FormsModule,
    Button,
    SlideToggle,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    ReactiveFormsModule,
    TranslocoPipe,
    CdkDrag,
    CdkDropList,
    CdkDragHandle,
    Icon,
    Card,
    CardActions,
    CardContent,
    CardTitle,
  ],
  templateUrl: './identity.html',
  styleUrl: './identity.scss',
})
export class Identity {
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _snackBar = inject(SnackBar);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _route = inject(ActivatedRoute);
  private _translateService = inject(TranslateService);
  private _dialog = inject(Dialog);

  form: any = this._formBuilder.group({
    isPublicCommunity: [false, Validators.required],
    registrationEnabled: [false, Validators.required],
    oAuthEnabled: [false, Validators.required],
    oAuthProviders: [[]]
  });
  settings: IdentitySettings;
  readonly oAuthProviders = signal<any[]>([]);
  loaded = signal(false);
  hostUrl = signal<string>('');

  // Map provider type to a corresponding dialog component
  private readonly _providerDialogMap: Record<string, any> = {
    github: GithubOauthProviderComponent,
    google: GoogleOauthProviderComponent,
    facebook: FacebookOauthProviderComponent,
    x: XOauthProviderComponent,
  };

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
        id: 'settings',
        route: '/admin/settings',
        name: 'breadcrumbs.settings',
        type: 'link'
      },
      {
        id: 'identity',
        name: 'breadcrumbs.settings.identity',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get('admin/settings/identity')
      .subscribe((res: any) => {
        this.settings = res.settings;
        this.form.patchValue({
          isPublicCommunity: this.settings.isPublicCommunity,
          registrationEnabled: this.settings.registrationEnabled,
          oAuthEnabled: this.settings.oAuthEnabled,
        });
        this.loaded.set(true);
      });

    this._api
      .get('admin/settings/oauth-providers')
      .subscribe((res: any) => {
        this.oAuthProviders.set(res.oAuthProviders);
        this.hostUrl.set(res.hostUrl);
      });
  }

  drop(event: CdkDragDrop<any[]>) {
    const list = [...this.oAuthProviders()];
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    // recompute positions
    const items = list.map((p, index) => ({id: p.id, position: index}));
    this.oAuthProviders.set(list);
    this._api.post('admin/settings/oauth-providers/reorder', {items}).subscribe({
      next: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.oauth.orderUpdated'), '', {
          verticalPosition: 'top',
          duration: 1500
        });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.oauth.orderUpdateFailed'), '', {
          verticalPosition: 'top',
          duration: 3000
        });
      }
    });
  }

  configure(provider: any, event?: Event) {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }

    const Component = this._providerDialogMap[provider?.type];
    if (!Component) {
      this._snackBar.open(this._translateService.instant('admin.settings.oauth.unsupported'), '', {
        verticalPosition: 'top',
        duration: 3000
      });
      return;
    }

    const dialogRef = this._dialog.open(
      Component,
      {
        data: {
          hostUrl: this.hostUrl(),
          isEnabled: provider.isEnabled,
          ...provider.config
        },
        width: '620px'
      }
    );
    dialogRef.afterClosed().subscribe((result) => {
      if (result && result.isConfigured) {
        const payload: any = {type: provider.type, isEnabled: result.isEnabled ?? true, config: result.formData};
        this._api.post('admin/settings/oauth-providers/provider/update', payload).subscribe({
          next: (res: any) => {
            const saved = res?.provider || {};
            const updated = this.oAuthProviders().map((p) =>
              p.type === provider.type
                ? {...p, ...saved}
                : p,
            );
            this.oAuthProviders.set(updated);
            this._snackBar.open(this._translateService.instant('admin.settings.oauth.saved'), '', {
              verticalPosition: 'top',
              duration: 2000
            });
          },
          error: () => {
            this._snackBar.open(this._translateService.instant('admin.settings.oauth.failed'), '', {
              verticalPosition: 'top',
              duration: 3000
            });
          }
        });
      }
    });
  }

  save(): void {
    const value = this.form.value as IdentitySettings;
    this.settings = {...this.settings, ...value};
    this._api
      .post('admin/settings/identity', {
        isPublicCommunity: this.form.value.isPublicCommunity,
        registrationEnabled: this.form.value.registrationEnabled,
        oAuthEnabled: this.form.value.oAuthEnabled,
      })
      .subscribe((res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.identity.saved'), '', {
          duration: 3000
        });
      });
  }
}
