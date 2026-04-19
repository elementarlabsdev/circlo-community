import { Component, inject, input } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import { Card, CardContent } from '@ngstarter/components/card';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { Dialog } from '@ngstarter/components/dialog';
import { SnackBar } from '@ngstarter/components/snack-bar';
import {
  IntegrationSettingsComponent
} from '@/studio/@studio/integrations/_modals/integration-settings/integration-settings.component';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-paypal-integration',
  imports: [
    Button,
    Card,
    CardContent,
    Icon,
    Button,
    Menu,
    MenuItem,
    TranslocoPipe,
    MenuTrigger
  ],
  templateUrl: './paypal-integration.component.html',
  styleUrl: './paypal-integration.component.scss'
})
export class PaypalIntegrationComponent {
  private dialog = inject(Dialog);
  private snackBar = inject(SnackBar);

  readonly integration = input.required<any>();

  configure() {
    const modalRef = this.dialog.open(IntegrationSettingsComponent, {
      data: {
        integration: this.integration()
      }
    });
    modalRef.afterClosed().subscribe((settings) => {
      if (settings) {
        this.integration().isConfigured = true;
        this.integration().settings = settings;
        this.snackBar.open('Settings saved successfully', '', {
          verticalPosition: 'top',
          duration: 2000
        });
      }
    });
  }

  revoke() {
  }
}
