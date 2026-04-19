import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { SettingsService } from '@services/settings.service';
import { ApiService } from '@services/api.service';
import { Divider } from '@ngstarter/components/divider';

@Component({
  selector: 'app-checkout',
  imports: [
    CommonModule,
    Divider
  ],
  templateUrl: './main.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutComponent implements OnInit {
  private api = inject(ApiService);
  private settingsService = inject(SettingsService);

  price = signal(0);
  loading = signal(false);

  async ngOnInit() {
    const priceValue = await this.settingsService.findValueByName<number>('monetizationPaidAccountPrice', 0);
    this.price.set(priceValue);
  }

  onCheckout() {
    this.loading.set(true);
    this.api.post<{ url: string }>('payments/checkout/account', {}).subscribe({
      next: (res) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err) => {
        console.error('Checkout error', err);
        this.loading.set(false);
      }
    });
  }
}
