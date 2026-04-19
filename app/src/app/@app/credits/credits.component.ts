import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, NgIf } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Button } from '@ngstarter/components/button';
import { Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-credits-purchase',
  standalone: true,
  imports: [CommonModule, FormsModule, Button, NgIf, TranslocoPipe],
  templateUrl: './credits.component.html',
  styleUrl: './credits.component.scss'
})
export class CreditsComponent {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private router = inject(Router);

  amount = 5; // default USD
  loading = false;
  error: string | null = null;

  buy() {
    this.error = null;
    if (!this.amount || this.amount < 1) {
      this.error = 'Minimum amount is 1 USD';
      return;
    }
    this.loading = true;
    this.api.post(`payments/credits/checkout`, { amount: this.amount })
      .subscribe({
        next: (res: any) => {
          this.loading = false;
          if (res?.url) {
            window.location.href = res.url;
          }
        },
        error: () => {
          this.loading = false;
          this.error = 'Failed to create checkout session';
        }
      });
  }
}
