import { Component, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { TutorialsApi } from '../tutorials.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';

@Component({
  selector: 'app-admin-tutorials-table',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss'
})
export class Table {
  private readonly api = inject(TutorialsApi);
  private readonly route = inject(ActivatedRoute);
  private readonly snack = inject(SnackBar);
  private readonly confirmManager = inject(ConfirmManager);
  private readonly appStore = inject(AppStore);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Title',
      field: 'title',
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
      name: 'Published',
      field: 'publishedAt',
      cellRenderer: 'date'
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      width: '120px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onEdit: (t: any) => this.edit(t),
        onUnpublish: (t: any) => this.unpublish(t),
        onDelete: (t: any) => this.delete(t)
      }
    }
  ];

  cellRenderers = [
    cellRenderer('status', () => import('@cell-renderers/status-cell-renderer/status-cell-renderer.component').then(m => m.StatusCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
    cellRenderer('actions', () => import('@cell-renderers/tutorial-actions-cell-renderer/tutorial-actions-cell-renderer.component').then(m => m.TutorialActionsCellRenderer)),
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
    this.appStore.setTitle(this.route.snapshot.title || '');
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
        name: 'breadcrumbs.admin',
        type: 'link'
      },
      {
        id: 'tutorials',
        name: 'breadcrumbs.tutorials',
        route: '/admin/tutorials',
        type: null
      }
    ]);
  }

  edit(tutorial: any) {
    // placeholder: open editor/view when implemented
  }

  unpublish(tutorial: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Unpublish tutorial',
      description: 'Are you sure you want to unpublish this tutorial?'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.unpublish(tutorial.id).subscribe({
        next: () => {
          this.snack.open('Unpublished!', 'OK', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Failed', undefined, { duration: 3000 })
      });
    });
  }

  delete(tutorial: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete tutorial',
      description: 'Deletion is not reversible, and the tutorial will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(tutorial.id).subscribe({
        next: () => {
          this.snack.open('Deleted!', 'OK', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
