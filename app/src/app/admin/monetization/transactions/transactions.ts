import { Component, inject, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CreditsApi } from '../credits/credits.api';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter/components/data-view';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { Panel, PanelContent, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe } from '@jsverse/transloco';
import { Toolbar, ToolbarTitle } from '@ngstarter/components/toolbar';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DataView,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    Toolbar,
    ToolbarTitle
  ],
  templateUrl: './transactions.html',
  styleUrl: './transactions.scss',
})
export class Transactions {
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private api = inject(CreditsApi);

  // DataView API ref (if needed for refresh)
  readonly datatable = viewChild<DataView<any>>('datagridRef');

  // Column definitions for DataView
  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Date',
      field: 'createdAt',
      cellRenderer: 'date'
    },
    {
      name: 'User',
      field: 'user',
      cellRenderer: 'user',
    },
    {
      name: 'Amount',
      field: 'amount'
    },
    {
      name: 'Type',
      field: 'type'
    },
    // {
    //   name: 'Details',
    //   field: 'details',
    //   valueGetter: (data: any) => data?.details ? JSON.stringify(data.details) : ''
    // }
  ];

  // Optional cell renderers (date)
  cellRenderers = [
    cellRenderer('user', () => import('@cell-renderers/user-cell-renderer/user-cell-renderer.component').then(m => m.UserCellRenderer)),
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
  ];

  // Server-side datasource
  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.api.getTransactions({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res: any) => {
          params.successCallback(res.items || res.data, res?.meta?.total ?? res.total ?? 0);
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
        id: '',
        route: '/admin/monetization',
        name: this.translate.instant('breadcrumbs.monetization'),
        type: 'link'
      },
      {
        id: '',
        route: '/admin/monetization/transactions',
        name: this.translate.instant('breadcrumbs.monetization.transactions'),
        type: null
      },
    ]);
  }
}
