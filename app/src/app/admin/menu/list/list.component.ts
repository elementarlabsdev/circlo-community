import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { MenusApi } from '../menus.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Router } from '@angular/router';
import { TranslateService } from '@services/translate.service';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'admin-menus-list',
  standalone: true,
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
    ToolbarTitle,
    ToolbarSpacer
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly confirmManager = inject(ConfirmManager);
  private readonly api = inject(MenusApi);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  loading = signal(false);
  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Name',
      field: 'name',
      width: '260px',
    },
    {
      name: 'Type',
      field: 'type',
    },
    {
      name: 'Position',
      field: 'position',
    },
    {
      name: 'Created',
      field: 'createdAt',
      cellRenderer: 'date'
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      pinned: true,
      pinAlign: 'end',
      width: '160px',
      params: {
        onEdit: (m: any) => this.edit(m),
        onDelete: (m: any) => this.delete(m)
      }
    }
  ];

  cellRenderers = [
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
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
        name: this.translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'menu',
        name: this.translate.instant('breadcrumbs.menu') || 'Menus',
        type: null
      }
    ]);
  }

  createNew() {
    this.router.navigate(['/admin/menus/new']);
  }

  edit(menu: any) {
    this.router.navigate(['/admin/menus', menu.id, 'edit']);
  }

  delete(menu: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete menu',
      description: 'Deletion is not reversible. This menu will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(menu.id).subscribe({
        next: () => {
          this.snack.open('Deleted!', 'OK', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
