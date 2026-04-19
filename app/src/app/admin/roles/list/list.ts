import { Component, inject, signal } from '@angular/core';
import { RolesApi, Role } from '../roles.api';
import {
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  cellRenderer, DataViewGetRowsParams, DataViewAPI
} from '@ngstarter/components/data-view';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AppStore } from '@store/app.store';
import { TranslateService } from '@services/translate.service';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'app-roles-list',
  standalone: true,
  imports: [
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    RouterLink,
    Button,
    Icon,
    ToolbarTitle,
    Toolbar,
    ToolbarSpacer,
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {
  private readonly rolesApi = inject(RolesApi);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(SnackBar);
  private readonly confirmManager = inject(ConfirmManager);
  private readonly appStore = inject(AppStore);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Name',
      field: 'name',
      sortable: true,
    },
    {
      name: 'Type',
      field: 'type',
      sortable: true,
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      width: '120px',
      pinned: true,
      pinAlign: 'end',
      sortable: false,
      withColumnSettings: false,
      params: {
        onDelete: (role: Role, api: DataViewAPI) => this.delete(role, api),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('actions', () => import('@cell-renderers/admin-roles-actions-cell-renderer/admin-roles-actions-cell-renderer.component')
      .then(m => m.AdminRolesActionsCellRendererComponent)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.rolesApi.paginate({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res) => {
          params.successCallback(res.data, res.total);
        },
        error: () => params.failCallback()
      });
    }
  };

  constructor() {
    this.appStore.setTitle(this.route.snapshot.title || 'Roles');
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'roles',
        name: 'Roles',
        route: '/admin/roles',
        type: null
      }
    ]);
  }

  delete(role: Role, api: DataViewAPI) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete role',
      description: `Are you sure you want to delete role "${role.name}"?`
    });
    confirmDef.confirmed.subscribe(() => {
      this.rolesApi.delete(role.id).subscribe({
        next: () => {
          this.snack.open('Role deleted', 'OK', { duration: 2000 });
          api.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
