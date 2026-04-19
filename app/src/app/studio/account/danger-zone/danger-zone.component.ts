import { Component, inject } from '@angular/core';
import { Divider } from '@ngstarter/components/divider';
import { Button } from '@ngstarter/components/button';
import { ReactiveFormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import { ActivatedRoute } from '@angular/router';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ApiService } from '@services/api.service';
import { AuthService } from '@services/auth.service';
import { ConfirmationManager } from '@services/confirmation-manager.service';
import { SnackBar } from '@ngstarter/components/snack-bar';

@Component({
  imports: [
    Divider,
    Button,
    ReactiveFormsModule,
    TranslocoPipe,
    ScrollbarArea,
    PanelContent,
    Panel,
    PanelHeader,
  ],
  templateUrl: './danger-zone.component.html',
  styleUrl: './danger-zone.component.scss'
})
export class DangerZoneComponent {
  private _route = inject(ActivatedRoute);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _appStore = inject(AppStore);
  private _api = inject(ApiService);
  private _auth = inject(AuthService);
  private _i18n = inject(TranslocoService);
  private _confirm = inject(ConfirmationManager);
  private _snackBar = inject(SnackBar);

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
        name: 'breadcrumbs.account.dangerZone',
        id: 'dangerZone',
        type: null
      }
    ]);
  }

  deactivateAccount(): void {
    this._confirm
      .confirm({
        title: 'dangerZone',
        message: 'studio.dangerZone.confirmDeactivate',
        confirmLabel: 'deactivate',
        cancelLabel: 'editor.buttonCancelLabel',
        color: 'warn',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this._api
          .post('studio/account/danger-zone/deactivate')
          .subscribe(() => this._auth.logout());
      });
  }

  deleteAccount(): void {
    this._confirm
      .confirm({
        title: 'dangerZone',
        message: 'studio.dangerZone.confirmDelete',
        confirmLabel: 'delete',
        cancelLabel: 'editor.buttonCancelLabel',
        color: 'warn',
      })
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this._api
          .post('studio/account/danger-zone/delete')
          .subscribe((resp: any) => {
            if (resp?.ok) {
              this._auth.logout();
              return;
            }
            if (resp?.code === 'SUPER_ADMIN_CANNOT_BE_DELETED') {
              this._snackBar.open(
                this._i18n.translate('errors.superAdminCannotBeDeleted'),
                this._i18n.translate('ok'),
                { duration: 4000 }
              );
              return;
            }
          });
      });
  }
}
