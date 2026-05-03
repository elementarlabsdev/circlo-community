import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslocoService } from '@jsverse/transloco';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { ChannelsApi } from '../channels.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';

@Component({
  selector: 'admin-channels-list',
  imports: [
    FormsModule,
    DataView,
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly confirmManager = inject(ConfirmManager);
  private readonly api = inject(ChannelsApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Name',
      field: 'name',
    },
    {
      name: 'Slug',
      field: 'slug',
    },
    {
      name: 'Followers',
      field: 'followersCount',
    },
    {
      name: 'Publications',
      field: 'publicationsCount',
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
      width: '160px',
      pinned: true,
      pinAlign: 'end',
      params: {
        onEdit: (c: any) => this.edit(c),
        onDelete: (c: any) => this.delete(c),
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
        name: this.translate.translate('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'channels',
        name: this.translate.translate('breadcrumbs.channels'),
        type: null
      }
    ]);
  }

  createNew() {
    this.router.navigate(['/admin/channels/new']);
  }

  edit(channel: any) {
    this.router.navigate(['/admin/channels', channel.id, 'edit']);
  }

  delete(channel: any) {
    const confirmDef = this.confirmManager.open({
      title: 'Delete channel',
      description: 'Deletion is not reversible, and the channel will be completely deleted.'
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(channel.id).subscribe({
        next: () => {
          this.snack.open('Deleted', '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open('Delete failed', undefined, { duration: 3000 })
      });
    });
  }
}
