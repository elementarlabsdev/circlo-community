import { Injectable, inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class StudioCreditsApi {
  private readonly api = inject(ApiService);

  getMyTransactions(params?: any): Observable<any> {
    return this.api.get('payments/transactions', { params });
  }

  createCheckout(amount: number): Observable<{ url: string }> {
    return this.api.post('payments/credits/checkout', { amount });
  }

  confirmPayment(sessionId: string): Observable<{ success: boolean; status?: string }> {
    return this.api.post('payments/confirm-payment', { sessionId });
  }

  getStripeStatus(): Observable<{ isConfigured: boolean }> {
    return this.api.get('payments/stripe-status');
  }
}
