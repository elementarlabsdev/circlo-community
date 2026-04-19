import { Component, inject, signal, viewChild } from '@angular/core';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { ThreadsApi } from '../threads.api';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Toolbar, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'admin-threads-list',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    Toolbar,
    ToolbarTitle,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly confirmManager = inject(ConfirmManager);
  private readonly api = inject(ThreadsApi);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);
  private readonly router = inject(Router);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.translate('admin.threads.content'),
      field: 'textContent',
      cellRenderer: 'content',
      width: '400px',
      minWidth: '400px',
    },
    {
      name: this.translate.translate('admin.threads.qualityScore'),
      field: 'qualityScore',
      cellRenderer: 'qualityScore',
      width: '180px',
    },
    {
      name: this.translate.translate('admin.threads.replies'),
      sortable: true,
      field: 'repliesCount',
    },
    {
      name: this.translate.translate('admin.threads.created'),
      field: 'createdAt',
      sortable: true,
      cellRenderer: 'date'
    },
    {
      name: this.translate.translate('table.action.actions'),
      field: 'actions',
      cellRenderer: 'actions',
      width: '200px',
      sortable: false,
      pinned: true,
      pinAlign: 'end',
      params: {
        onView: (t: any) => this.view(t),
        onEdit: (t: any) => this.edit(t),
        onDelete: (t: any) => this.delete(t),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('content', () => import('@cell-renderers/thread-content-cell-renderer/thread-content-cell-renderer').then(m => m.ThreadContentCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
    cellRenderer('actions', () => import('@cell-renderers/thread-actions-cell-renderer/thread-actions-cell-renderer.component').then(m => m.ThreadActionsCellRenderer)),
    cellRenderer('qualityScore', () => import('@cell-renderers/quality-score-cell-renderer/quality-score-cell-renderer.component').then(m => m.QualityScoreCellRendererComponent)),
    cellRenderer('boolean', () => import('@cell-renderers/boolean-cell-renderer/boolean-cell-renderer.component').then(m => m.BooleanCellRendererComponent)),
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
        id: 'threads',
        name: this.translate.translate('breadcrumbs.threads'),
        type: null
      }
    ]);
  }

  view(thread: any) {
    this.router.navigate(['/admin/threads', thread.id, 'view']);
  }

  edit(thread: any) {
    this.router.navigate(['/admin/threads', thread.id, 'edit']);
  }

  delete(thread: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.translate('admin.threads.deleteTitle'),
      description: this.translate.translate('admin.threads.deleteDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(thread.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('admin.threads.deleted'), '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open(this.translate.translate('admin.threads.deleteFailed'), undefined, { duration: 3000 })
      });
    });
  }
}
