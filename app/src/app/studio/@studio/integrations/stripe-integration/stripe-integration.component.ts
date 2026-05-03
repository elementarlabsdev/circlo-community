import { Component, inject, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { TranslocoPipe } from '@jsverse/transloco';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import {
  IntegrationSettingsComponent
} from '@/studio/@studio/integrations/_modals/integration-settings/integration-settings.component';
import { Icon } from '@ngstarter-ui/components/icon';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-stripe-integration',
  imports: [
    Button,
    Card,
    CardContent,
    Icon,
    Button,
    TranslocoPipe,
    Menu,
    MenuItem,
    MenuTrigger
  ],
  templateUrl: './stripe-integration.component.html',
  styleUrl: './stripe-integration.component.scss'
})
export class StripeIntegrationComponent {
  private dialog = inject(Dialog);
  private snackBar = inject(SnackBar);
  private apiService = inject(ApiService);

  readonly integration = input.required<any>();

  configure() {
    this.apiService.post('payments/connect/onboarding').subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this.snackBar.open('Error starting onboarding', 'Close', { duration: 3000 });
      }
    });
  }

  revoke() {
  }
}
