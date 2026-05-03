import { Component, inject, signal, viewChild } from '@angular/core';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { FormRenderer } from '@ngstarter-ui/components/form-renderer';
import { Button } from '@ngstarter-ui/components/button';
import { BlockLoader } from '@ngstarter-ui/components/block-loader';
import { ApiService } from '@services/api.service';

@Component({
  imports: [
    DialogTitle,
    DialogContent,
    FormRenderer,
    DialogActions,
    Button,
    BlockLoader
  ],
  templateUrl: './integration-settings.component.html',
  styleUrl: './integration-settings.component.scss'
})
export class IntegrationSettingsComponent {
  readonly data = inject(DIALOG_DATA);
  readonly dialogRef = inject(DialogRef);
  readonly api = inject(ApiService);
  readonly formRenderer = viewChild.required<FormRenderer>('formRenderer');
  readonly saving = signal(false);

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.api
      .post(
        `studio/integrations/${this.data.integration.id}`,
        { settings: this.formRenderer().value }
      )
      .subscribe(() => {
        this.dialogRef.close(this.formRenderer().value);
      });
  }
}
