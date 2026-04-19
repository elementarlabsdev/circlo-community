import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ConfirmManager } from '@ngstarter/components/confirm';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { PagesApi } from '../pages.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { TranslateService } from '@services/translate.service';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter/components/toolbar';
import { Ability } from '@casl/ability';
import { Action } from '@services/ability.service';

@Component({
  selector: 'admin-pages-list',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    Toolbar,
    ToolbarSpacer,
    ToolbarTitle,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly api = inject(PagesApi);
  private readonly router = inject(Router);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly snack = inject(SnackBar);
  private readonly confirmManager = inject(ConfirmManager);
  readonly ability = inject(Ability);
  readonly Action = Action;

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Title',
      field: 'title',
      cellRenderer: 'pageTitle'
    },
    {
      name: 'Status',
      field: 'status',
      cellRenderer: 'status'
    },
    {
      name: 'Created',
      field: 'createdAt',
      cellRenderer: 'date'
    },
    {
      name: 'Updated',
      field: 'updatedAt',
      cellRenderer: 'date'
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      resizable: false,
      sortable: false,
      width: '160px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onEdit: (p: any) => this.edit(p),
        onDelete: (p: any) => this.delete(p),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('pageTitle', () => import('@cell-renderers/page-title-cell-renderer/page-title-cell-renderer').then(m => m.PageTitleCellRenderer)),
    cellRenderer('status', () => import('@cell-renderers/status-cell-renderer/status-cell-renderer.component').then(m => m.StatusCellRenderer)),
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
      {id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular'},
      {id: 'admin', route: '/admin', name: this.translate.instant('breadcrumbs.admin'), type: 'link'},
      {id: 'pages', name: this.translate.instant('breadcrumbs.pages') || 'Pages', type: null}
    ]);
  }

  createNew() {
    this.api.createNew().subscribe(({page}) => {
      this.router.navigate(['/admin/pages/edit', page.hash]);
    });
  }

  edit(page: any) {
    this.router.navigate(['/admin/pages/edit', page.hash]);
  }

  delete(page: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete page',
      description: 'Deletion is not reversible. This page will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(page.hash).subscribe({
        next: () => {
          this.snack.open('Deleted!', 'OK', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
