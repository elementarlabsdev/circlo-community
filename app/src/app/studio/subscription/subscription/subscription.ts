import { ChangeDetectionStrategy, Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SubscriptionService, Transaction } from '@services/subscription.service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { ConfirmationManager } from '@services/confirmation-manager.service';
import { TranslateService } from '@services/translate.service';
import { Card, CardActions, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import {
  cellRenderer,
  DataView,
  DataViewColumnDef,
  DataViewDatasource,
  DataViewGetRowsParams
} from '@ngstarter-ui/components/data-view';
import { Button } from '@ngstarter-ui/components/button';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    CommonModule,
    TranslocoModule,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    DataView,
    Button,
    DatePipe,
    CardActions
  ],
  templateUrl: './subscription.html',
  styleUrl: './subscription.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Subscription implements OnInit {
  private _subscriptionService = inject(SubscriptionService);
  private _confirmationManager = inject(ConfirmationManager);
  private _translate = inject(TranslateService);
  private _transloco = inject(TranslocoService);
  private _route = inject(ActivatedRoute);
  private _snackBar = inject(SnackBar);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  info = this._subscriptionService.subscriptionInfo;
  transactions = this._subscriptionService.transactions;
  loading = this._subscriptionService.loading;

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.subscription',
        id: 'subscription',
        type: null
      }
    ]);
  }

  columnDefs: DataViewColumnDef[] = [
    {
      name: this._translate.instant('subscription.date'),
      field: 'date',
      cellRenderer: 'date'
    },
    {
      name: this._translate.instant('subscription.name'),
      field: 'name'
    },
    {
      name: this._translate.instant('subscription.amount'),
      field: 'amount',
      valueGetter: (data: Transaction) => `${data.amount} ${data.currency.toUpperCase()}`
    },
    {
      name: this._translate.instant('subscription.status'),
      field: 'status'
    }
  ];

  cellRenderers = [
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this._subscriptionService.fetchTransactions(params.page + 1, params.pageSize).subscribe({
        next: (res) => {
          params.successCallback(res.items, res.total);
        },
        error: () => params.failCallback()
      });
    }
  };

  ngOnInit(): void {
    this._subscriptionService.fetchSubscriptionInfo().subscribe();
  }

  cancelSubscription(): void {
    this._confirmationManager.confirm({
      title: 'subscription.cancelTitle',
      message: 'subscription.cancelMessage',
    }).subscribe((confirmed: boolean) => {
      if (confirmed) {
        this._subscriptionService.cancelSubscription().subscribe({
          next: () => {
            this._snackBar.open(this._transloco.translate('subscription.cancelSuccess'));
          },
          error: (err) => {
            console.error('Error cancelling subscription', err);
          }
        });
      }
    });
  }

  activateSubscription(): void {
    this._subscriptionService.createCheckoutSession().subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('Error creating checkout session', err);
      }
    });
  }
}
