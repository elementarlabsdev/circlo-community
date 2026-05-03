import { Component, inject, input } from '@angular/core';
import { Button } from '@ngstarter-ui/components/button';
import { Card, CardContent } from '@ngstarter-ui/components/card';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter-ui/components/menu';
import { TranslocoPipe } from '@jsverse/transloco';
import { Icon } from '@ngstarter-ui/components/icon';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import {
  IntegrationSettingsComponent
} from '@/studio/@studio/integrations/_modals/integration-settings/integration-settings.component';

@Component({
  selector: 'app-paddle-integration',
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
  templateUrl: './paddle-integration.component.html',
  styleUrl: './paddle-integration.component.scss'
})
export class PaddleIntegrationComponent {
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
