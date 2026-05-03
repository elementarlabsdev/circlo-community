import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';

import { Divider } from '@ngstarter-ui/components/divider';

import { SettingsService } from '@services/settings.service';

@Component({
  selector: 'app-checkout-success',
  imports: [
    CommonModule,
    RouterModule,
    TranslocoPipe,
    Divider
  ],
  templateUrl: './success.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckoutSuccessComponent implements OnInit {
  authService = inject(AuthService);
  private api = inject(ApiService);
  private route = inject(ActivatedRoute);
  private appStore = inject(AppStore);
  private settingsService = inject(SettingsService);

  loading = signal(true);

  ngOnInit() {
    const sessionId = this.route.snapshot.queryParamMap.get('session_id');
    if (sessionId) {
      this.api.post('payments/confirm-payment', { sessionId }).subscribe({
        next: () => {
          this.refreshProfile();
        },
        error: () => {
          this.loading.set(false);
        }
      });
    } else {
      this.refreshProfile();
    }
  }

  private async refreshProfile() {
    try {
      const res = await this.settingsService.reload();
      this.appStore.setProfile(res.profile as any);
      this.loading.set(false);
    } catch (e) {
      this.loading.set(false);
    }
  }
}
