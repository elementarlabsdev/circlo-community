import { Component, inject, OnInit, signal } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Divider } from '@ngstarter-ui/components/divider';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter-ui/components/panel';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { AuthService } from '@services/auth.service';
import { ChangePasswordDialogComponent } from './change-password.dialog';
import { ChangeEmailDialogComponent } from './change-email.dialog';
import { Card, CardActions, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  imports: [
    Button,
    FormsModule,
    Divider,
    ReactiveFormsModule,
    TranslocoPipe,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
    Card,
    CardContent,
    Icon,
    CardHeader,
    CardActions,
  ],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent implements OnInit {
  private _api = inject(ApiService);
  private _formBuilder = inject(FormBuilder);
  private _route = inject(ActivatedRoute);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _appStore = inject(AppStore);
  private _dialog = inject(Dialog);
  private _auth = inject(AuthService);

  loaded = signal(false);
  oauthProviders = signal<any[]>([]);

  form = this._formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    mfaEnabled: [false, [Validators.required]],
    mfaConfigured: [false, [Validators.required]],
  });

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
        name: 'breadcrumbs.account.security',
        id: 'security',
        type: null
      }
    ]);
  }

  setup2stepVerification() {
    this.form.get('mfaConfigured')?.setValue(true);
  }

  changePassword(): void {
    const ref = this._dialog.open(ChangePasswordDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        this._auth.logout('/auth/signin');
      }
    });
  }

  changeEmail(): void {
    const ref = this._dialog.open(ChangeEmailDialogComponent, {
      width: '480px',
      disableClose: true,
    });
    ref.afterClosed().subscribe((result) => {
      if (result) {
        const email = typeof result === 'string' ? result : this.form.get('email')?.value;
        if (email) {
          this.form.get('email')?.setValue(email as any);
        }
      }
    });
  }

  disconnect(id: string) {
    this._api
      .delete(`studio/account/security/oauth-providers/${id}`)
      .subscribe(() => {
        this.oauthProviders.update((providers) => providers.filter((p) => p.id !== id));
      });
  }

  ngOnInit() {
    this._api
      .get('studio/account/security')
      .subscribe((res: any) => {
        this.form.patchValue({
          email: res.email || '',
          mfaEnabled: res.securitySettings?.mfaEnabled ?? false,
          mfaConfigured: res.securitySettings?.mfaConfigured ?? false,
        });
        this.oauthProviders.set(res.oauthProviders || []);
        this.loaded.set(true);
      });
  }
}
