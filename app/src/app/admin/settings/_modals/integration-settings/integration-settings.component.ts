import { Component, inject, OnInit, signal, viewChild } from '@angular/core';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { DIALOG_DATA } from '@angular/cdk/dialog';
import { FormRenderer } from '@ngstarter/components/form-renderer';
import { Button } from '@ngstarter/components/button';
import { BlockLoader } from '@ngstarter/components/block-loader';
import { ApiService } from '@services/api.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [
    DialogTitle,
    DialogContent,
    FormRenderer,
    DialogActions,
    Button,
    BlockLoader,
    TranslocoModule
  ],
  templateUrl: './integration-settings.component.html',
  styleUrl: './integration-settings.component.scss'
})
export class IntegrationSettingsComponent implements OnInit {
  readonly data = inject(DIALOG_DATA);
  readonly dialogRef = inject(DialogRef);
  readonly api = inject(ApiService);
  readonly formRenderer = viewChild.required<FormRenderer>('formRenderer');
  readonly saving = signal(false);

  ngOnInit() {
  }

  cancel() {
    this.dialogRef.close();
  }

  save() {
    this.api
      .post(
        `admin/settings/integrations/${this.data.integration.id}`,
        { settings: this.formRenderer().value }
      )
      .subscribe(() => {
        this.dialogRef.close(this.formRenderer().value);
      });
  }
}
