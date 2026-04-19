import { Injectable, inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CreditsApi {
  private readonly api = inject(ApiService);

  getTransactions(params: any): Observable<any> {
    return this.api.get('admin/credits/transactions', { params });
  }

  adjustCredits(body: any): Observable<any> {
    return this.api.post('admin/credits/adjust', body);
  }
}
