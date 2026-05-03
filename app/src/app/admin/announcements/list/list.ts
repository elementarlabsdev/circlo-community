import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { AnnouncementsApi } from '../announcements.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { Toolbar, ToolbarSpacer, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'admin-announcements-list',
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
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List {
  private confirmManager = inject(ConfirmManager);
  private readonly api = inject(AnnouncementsApi);
  private readonly router = inject(Router);
  private readonly snack = inject(SnackBar);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.instant('announcements.name'),
      field: 'name',
    },
    {
      name: this.translate.instant('announcements.status'),
      field: 'status',
      cellRenderer: 'status'
    },
    {
      name: this.translate.instant('announcements.type'),
      field: 'type',
      cellRenderer: 'type'
    },
    {
      name: this.translate.instant('announcements.priority'),
      field: 'priority',
    },
    {
      name: this.translate.instant('table.publishedAt'),
      field: 'createdAt',
      cellRenderer: 'date'
    },
    {
      name: this.translate.instant('table.action.actions'),
      field: 'actions',
      cellRenderer: 'actions',
      width: '160px',
      params: {
        onEdit: (a: any) => this.edit(a),
        onDelete: (a: any) => this.delete(a),
      }
    }
  ];

  cellRenderers = [
    cellRenderer('status', () => import('@cell-renderers/announcement-status-cell-renderer/announcement-status-cell-renderer.component').then(m => m.AnnouncementStatusCellRenderer)),
    cellRenderer('type', () => import('@cell-renderers/announcement-type-cell-renderer/announcement-type-cell-renderer.component').then(m => m.AnnouncementTypeCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
    cellRenderer('actions', () => import('@cell-renderers/announcement-actions-cell-renderer/announcement-actions-cell-renderer.component').then(m => m.AnnouncementActionsCellRenderer)),
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
        id: 'announcements',
        name: this.translate.instant('breadcrumbs.admin.announcements'),
        type: null
      }
    ]);
  }

  createNew() {
    this.router.navigate(['/admin/announcements/new']);
  }

  edit(announcement: any) {
    this.router.navigate(['/admin/announcements', announcement.id, 'edit']);
  }

  delete(announcement: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.instant('announcements.confirmDeletion'),
      description: this.translate.instant('announcements.areYouSureYouWantToDeleteAnnouncement')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(announcement.id).subscribe({
        next: () => {
          this.snack.open(this.translate.instant('delete'), '', { duration: 2000 });
          (this.datatable()?.api as any)?.refresh();
        },
        error: () => this.snack.open(this.translate.instant('table.action.deleteFailed'), undefined, { duration: 3000 })
      });
    });
  }
}
