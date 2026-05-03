import { Component, inject, signal, viewChild } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { LayoutsApi } from '../layouts.api';
import { TranslocoPipe } from '@jsverse/transloco';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { TranslateService } from '@services/translate.service';
import { Toolbar, ToolbarTitle } from '@ngstarter-ui/components/toolbar';

@Component({
  selector: 'admin-layout-list',
  standalone: true,
  imports: [
    FormsModule,
    DataView,
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    Toolbar,
    ToolbarTitle,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly api = inject(LayoutsApi);
  private readonly router = inject(Router);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);

  loading = signal(false);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  columnDefs: DataViewColumnDef[] = [
    {
      name: this.translate.instant('common.name'),
      field: 'name',
    },
    {
      name: this.translate.instant('common.position'),
      field: 'position',
    },
    {
      name: this.translate.instant('common.actions'),
      field: 'actions',
      cellRenderer: 'actions',
      pinned: true,
      pinAlign: 'end',
      width: '160px',
      params: {
        onEdit: (l: any) => this.edit(l),
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
        id: 'layout',
        name: this.translate.instant('breadcrumbs.admin.layout'),
        type: null
      }
    ]);
  }

  edit(layout: any) {
    this.router.navigate(['/admin/layout', layout.id, 'edit']);
  }
}
