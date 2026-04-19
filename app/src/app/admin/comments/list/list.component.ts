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
import { CommentsApi } from '../comments.api';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Toolbar, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'admin-comments-list',
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
  private readonly api = inject(CommentsApi);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);
  private readonly router = inject(Router);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.translate('admin.comments.content'),
      field: 'textContent',
      cellRenderer: 'content',
      width: '400px',
      minWidth: '400px',
    },
    {
      name: this.translate.translate('admin.comments.qualityScore'),
      field: 'qualityScore',
      cellRenderer: 'qualityScore',
      width: '180px',
    },
    {
      name: this.translate.translate('admin.comments.hidden'),
      field: 'isHidden',
      sortable: true,
      cellRenderer: 'boolean'
    },
    {
      name: this.translate.translate('admin.comments.publication'),
      sortable: true,
      field: 'publication.title',
      width: '240px',
    },
    {
      name: this.translate.translate('admin.comments.replies'),
      sortable: true,
      field: 'repliesCount',
    },
    {
      name: this.translate.translate('admin.comments.created'),
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
        onView: (c: any) => this.view(c),
        onEdit: (c: any) => this.edit(c),
        onDelete: (c: any) => this.delete(c),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('content', () => import('@cell-renderers/comment-content-cell-renderer/comment-content-cell-renderer.component').then(m => m.CommentContentCellRendererComponent)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
    cellRenderer('actions', () => import('@cell-renderers/common-actions-cell-renderer/common-actions-cell-renderer.component').then(m => m.CommonActionsCellRenderer)),
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
        id: 'comments',
        name: this.translate.translate('breadcrumbs.comments'),
        type: null
      }
    ]);
  }

  view(comment: any) {
    this.router.navigate(['/admin/comments', comment.id, 'view']);
  }

  edit(comment: any) {
    this.router.navigate(['/admin/comments', comment.id, 'edit']);
  }

  delete(comment: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.translate('admin.comments.deleteTitle'),
      description: this.translate.translate('admin.comments.deleteDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(comment.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('admin.comments.deleted'), '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open(this.translate.translate('admin.comments.deleteFailed'), undefined, { duration: 3000 })
      });
    });
  }
}
