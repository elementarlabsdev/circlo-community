import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { ConfirmManager } from '@ngstarter/components/confirm';
import { TopicsApi } from '../topics.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'admin-topics-list',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    TranslocoPipe
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly confirmManager = inject(ConfirmManager);
  private readonly api = inject(TopicsApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Name',
      field: 'name',
      sortable: true,
    },
    {
      name: 'Followers',
      field: 'followersCount',
      sortable: true,
    },
    {
      name: 'Publications',
      field: 'publicationsCount',
      sortable: true,
    },
    {
      name: 'Actions',
      field: 'actions',
      cellRenderer: 'actions',
      width: '160px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onEdit: (t: any) => this.edit(t),
        onDelete: (t: any) => this.delete(t),
      }
    }
  ];

  cellRenderers = [
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
        id: 'topics',
        name: this.translate.instant('breadcrumbs.topics'),
        type: null
      }
    ]);
  }

  createNew() {
    this.router.navigate(['/admin/topics/new']);
  }

  edit(topic: any) {
    this.router.navigate(['/admin/topics', topic.id, 'edit']);
  }

  delete(topic: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete topic',
      description: 'Deletion is not reversible, and the topic will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(topic.id).subscribe({
        next: () => {
          this.snack.open('Deleted', '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
