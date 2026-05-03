import { booleanAttribute, Component, inject, input, OnInit, PLATFORM_ID } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '@services/auth.service';
import { ApiService } from '@services/api.service';
import { SubscriptionStore } from '@store/subscription.store';
import { Skeleton } from '@ngstarter-ui/components/skeleton';
import { LoginGuardComponent } from '@app/login-guard/login-guard.component';
import { Tooltip } from '@ngstarter-ui/components/tooltip';
import { Icon } from '@ngstarter-ui/components/icon';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-subscription',
  standalone: true,
  imports: [
    Button,
    Skeleton,
    LoginGuardComponent,
    Button,
    Tooltip,
    Icon,
    TranslocoPipe
  ],
  templateUrl: './subscription.component.html',
  styleUrl: './subscription.component.scss'
})
export class SubscriptionComponent implements OnInit {
  private _platform = inject(PLATFORM_ID);
  private _authService= inject(AuthService);
  private _apiService= inject(ApiService);
  private _appStore = inject(AppStore);
  protected subscriptionStore = inject(SubscriptionStore);
  protected loading = false;
  protected isLogged = this._authService.isLogged();

  targetId = input.required<string>();
  targetType = input.required<string>();
  compact = input(false, {
    transform: booleanAttribute
  });

  get isDisabled(): boolean {
    if (this.targetType() === 'user' && this._appStore.profile()) {
      return this._appStore.profile()?.id === this.targetId();
    }

    return false;
  }

  ngOnInit() {
    if (isPlatformBrowser(this._platform)) {
      this.loading = false;
    }
  }

  follow(): void {
    this.subscriptionStore.add(this.targetId(), this.targetType());
    this._apiService
      .post(`${this.targetType()}/${this.targetId()}/subscription`)
      .subscribe(() => {
      });
  }

  unfollow(): void {
    this.subscriptionStore.remove(this.targetId());
    this._apiService
      .delete(`${this.targetType()}/${this.targetId()}/subscription`)
      .subscribe(() => {
      });
  }
}
