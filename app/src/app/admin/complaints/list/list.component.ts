import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { ConfirmManager } from '@ngstarter/components/confirm';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { ComplaintsApi } from '../complaints.api';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';

// Row type for Admin Complaints DataTable
export interface AdminComplaintRow {
  id: string;
  name?: string | null;
  targetType: string;
  targetId: string;
  reporter?: { id: string; name: string; email: string } | null;
  reason?: { id: string; code: string; name: string } | null;
  status?: { id: string; code: string; name: string } | null;
  details?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
}

@Component({
  selector: 'admin-complaints-list',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss',
})
export class ListComponent {
  private readonly api = inject(ComplaintsApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);
  private readonly confirmManager = inject(ConfirmManager);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.translate('common.id'),
      field: 'name',
    },
    {
      name: this.translate.translate('admin.complaints.reportedUrl'),
      field: 'reportedUrl',
      cellRenderer: 'link'
    },
    {
      name: this.translate.translate('admin.complaints.type'),
      field: 'targetType',
    },
    {
      name: this.translate.translate('admin.complaints.reporter'),
      field: 'reporter',
      cellRenderer: 'user'
    },
    {
      name: this.translate.translate('admin.complaints.reason'),
      field: 'reason.name',
    },
    {
      name: this.translate.translate('admin.complaints.status'),
      field: 'status.name',
    },
    {
      name: this.translate.translate('admin.complaints.created'),
      field: 'createdAt',
      cellRenderer: 'date'
    },
    {
      name: this.translate.translate('table.action.actions'),
      field: 'actions',
      cellRenderer: 'actions',
      width: '160px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onView: (row: any) => this.view(row),
        onDelete: (row: any) => this.delete(row),
      }
    },
  ];

  cellRenderers = [
    cellRenderer('link', () => import('@cell-renderers/link-cell-renderer/link-cell-renderer.component')
      .then(m => m.LinkCellRenderer)),
    cellRenderer('user', () => import('@cell-renderers/user-cell-renderer/user-cell-renderer.component')
      .then(m => m.UserCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer')
      .then(m => m.DateCellRenderer)),
    cellRenderer('actions', () => import('@cell-renderers/complaints-actions-cell-renderer/common-actions-cell-renderer.component')
      .then(m => m.CommonActionsCellRenderer)),
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
      { id: 'home', route: '/', type: 'link', iconName: 'fluent:home-24-regular' },
      {
        id: 'admin',
        route: '/admin',
        name: this.translate.translate('breadcrumbs.admin'),
        type: 'link',
      },
      {
        id: 'complaints',
        name: this.translate.translate('breadcrumbs.complaints'),
        route: '/admin/complaints',
        type: null,
      },
    ]);
  }

  view(row: any) {
    this.router.navigate(['/admin/complaints', row.id]);
  }

  delete(row: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.translate('admin.complaints.deleteTitle'),
      description: this.translate.translate('admin.complaints.deleteDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(row.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('admin.complaints.deleted'), '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open(this.translate.translate('admin.complaints.deleteFailed'), undefined, { duration: 3000 })
      });
    });
  }
}
