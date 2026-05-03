import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { UsersApi } from '../users.api';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

import { FormsModule } from '@angular/forms';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'admin-users-list',
  imports: [
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    TranslocoPipe,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private confirmManager = inject(ConfirmManager);
  private readonly api = inject(UsersApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.translate('admin.users.name'),
      field: 'name',
      width: '300px',
      minWidth: '300px',
      cellRenderer: 'name',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.username'),
      field: 'username',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.email'),
      field: 'email',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.created'),
      field: 'createdAt',
      cellRenderer: 'date',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.blocked'),
      field: 'isBlocked',
      cellRenderer: 'boolean',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.verified'),
      field: 'verified',
      cellRenderer: 'boolean',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('admin.users.admin'),
      field: 'isSuperAdmin',
      cellRenderer: 'boolean',
      sortable: true,
      resizable: true
    },
    {
      name: this.translate.translate('table.action.actions'),
      field: 'actions',
      cellRenderer: 'actions',
      width: '200px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onView: (u: any) => this.view(u),
        onEdit: (u: any) => this.edit(u),
        onDelete: (u: any) => this.delete(u),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('name', () => import('@cell-renderers/user-name-renderer/user-name-renderer').then(m => m.UserNameRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
    cellRenderer('boolean', () => import('@cell-renderers/boolean-cell-renderer/boolean-cell-renderer.component').then(m => m.BooleanCellRendererComponent)),
    cellRenderer('actions', () => import('@cell-renderers/common-actions-cell-renderer/common-actions-cell-renderer.component').then(m => m.CommonActionsCellRenderer)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.api.paginate({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res: any) => {
          params.successCallback(res.data, res.total);
        },
        error: () => params.failCallback()
      });
    }
  };

  constructor() {
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
        name: this.translate.translate('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'users',
        name: this.translate.translate('breadcrumbs.admin.users'),
        type: null
      }
    ]);
  }

  createNew() {
    this.router.navigate(['/admin/users/new']);
  }

  view(user: any) {
    this.router.navigate(['/admin/users', user.id, 'view']);
  }

  edit(user: any) {
    this.router.navigate(['/admin/users', user.id, 'edit']);
  }

  delete(user: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.translate('admin.users.deleteTitle'),
      description: this.translate.translate('admin.users.deleteDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(user.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('admin.users.deleted'), '', {duration: 2000});
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open(this.translate.translate('admin.users.deleteFailed'), undefined, {duration: 3000})
      });
    });
  }
}
