import { inject, Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, tap } from 'rxjs';

export interface SubscriptionInfo {
  hasActiveSubscription: boolean;
  status?: string;
  currentPeriodEnd?: string;
  cancelAtPeriodEnd?: boolean;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  type: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private _api = inject(ApiService);

  subscriptionInfo = signal<SubscriptionInfo | null>(null);
  transactions = signal<Transaction[]>([]);
  loading = signal(false);

  fetchSubscriptionInfo(): Observable<SubscriptionInfo> {
    this.loading.set(true);
    return this._api.get<SubscriptionInfo>('payments/subscription/info').pipe(
      tap(info => {
        this.subscriptionInfo.set(info);
        this.loading.set(false);
      })
    );
  }

  fetchTransactions(page: number = 1, limit: number = 10): Observable<{ items: Transaction[], total: number }> {
    return this._api.get<{ items: Transaction[], total: number }>('payments/transactions', {
      params: {
        page,
        limit
      }
    }).pipe(
      tap(res => this.transactions.set(res.items))
    );
  }

  cancelSubscription(): Observable<{ success: boolean }> {
    return this._api.post<{ success: boolean }>('payments/subscription/cancel', {}).pipe(
      tap(() => this.fetchSubscriptionInfo().subscribe())
    );
  }

  createCheckoutSession(): Observable<{ url: string }> {
    return this._api.post<{ url: string }>('payments/checkout/account', {});
  }
}
