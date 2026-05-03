import { Component, inject, viewChild, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, Validators } from '@angular/forms';
import { StudioCreditsApi } from './credits.api';
import { cellRenderer, DataView, DataViewColumnDef, DataViewDatasource, DataViewGetRowsParams } from '@ngstarter-ui/components/data-view';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoModule } from '@jsverse/transloco';
import { Alert } from '@ngstarter-ui/components/alert';
import { Card, CardContent, CardActions, CardTitle, CardHeader } from '@ngstarter-ui/components/card';
import { FormField, Label, TextSuffix } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { ActivatedRoute, Router } from '@angular/router';

import { Icon } from '@ngstarter-ui/components/icon';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-credits',
  standalone: true,
  imports: [CommonModule, DataView, Button, TranslocoModule, Alert, Card, CardContent, CardTitle, Icon, ReactiveFormsModule, FormField, Label, Input, TextSuffix, CardHeader],
  templateUrl: './credits.html',
  styleUrl: './credits.scss',
})
export class Credits implements OnInit, OnDestroy {
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private api = inject(StudioCreditsApi);

  private queryParamsSubscription?: Subscription;

  readonly datatable = viewChild<DataView<any>>('datagridRef');

  isStripeConfigured = signal<boolean>(true);
  paymentStatus = signal<'success' | 'cancel' | 'processing' | null>(null);
  amount = new FormControl(10, { nonNullable: true, validators: [Validators.required, Validators.min(1)] });

  columnDefs: DataViewColumnDef[] = [
    {
      name: 'Date',
      field: 'date',
      cellRenderer: 'date'
    },
    {
      name: 'Amount',
      field: 'amount'
    },
    {
      name: 'Currency',
      field: 'currency'
    },
    {
      name: 'Type',
      field: 'type'
    },
    {
      name: 'Name',
      field: 'name'
    },
    {
      name: 'Status',
      field: 'status'
    }
  ];

  cellRenderers = [
    cellRenderer('date', () => import('@cell-renderers/date-cell/date-cell.renderer').then(m => m.DateCellRenderer)),
  ];

  datasource: DataViewDatasource = {
    getItems: (params: DataViewGetRowsParams) => {
      this.api.getMyTransactions({
        page: params.page + 1,
        pageSize: params.pageSize,
        globalFilter: params.filterModel,
        globalSort: params.sortModel,
      }).subscribe({
        next: (res: any) => {
          const items = res.data || res.items || (Array.isArray(res) ? res : []);
          const total = res.total || res?.meta?.total || (Array.isArray(res) ? res.length : items.length);
          params.successCallback(items, total);
        },
        error: () => params.failCallback()
      });
    }
  };

  constructor() {
    this.api.getStripeStatus().subscribe((res) => {
      this.isStripeConfigured.set(res.isConfigured);
    });

    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        route: '/studio',
        name: 'Studio',
        type: 'link'
      },
      {
        id: 'credits',
        route: '/studio/credits',
        name: 'Credits',
        type: null
      },
    ]);
  }

  ngOnInit() {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      const sessionId = params['session_id'];
      if (params['payment'] === 'success') {
        if (sessionId) {
          this.paymentStatus.set('processing');
          this.api.confirmPayment(sessionId).subscribe({
            next: (res) => {
              if (res.success) {
                this.paymentStatus.set('success');
                this.datatable()?.pageIndex.set(0);
                // Clear query params to prevent re-processing on refresh
                this.router.navigate([], {
                  relativeTo: this.route,
                  queryParams: { payment: 'success' }, // Keep only success flag without session_id
                  replaceUrl: true
                });
              } else {
                this.paymentStatus.set('cancel');
              }
            },
            error: () => {
              this.paymentStatus.set('cancel');
            }
          });
        } else {
          this.paymentStatus.set('success');
        }
      } else if (params['payment'] === 'cancel') {
        this.paymentStatus.set('cancel');
      }
    });
  }

  ngOnDestroy() {
    this.queryParamsSubscription?.unsubscribe();
  }

  buyCredits() {
    const val = this.amount.value;
    if (this.amount.invalid || val < 1) return;

    this.api.createCheckout(val).subscribe((res) => {
      if (res.url) {
        window.location.href = res.url;
      }
    });
  }
}
