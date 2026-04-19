import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-google-analytics',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    SlideToggle,
    ReactiveFormsModule,
    TranslocoModule
  ],
  templateUrl: './google-analytics.component.html',
  styleUrl: './google-analytics.component.scss'
})
export class GoogleAnalyticsComponent {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    googleAnalyticsId: [this._data?.googleAnalyticsId || '', Validators.required],
    isEnabled: [this._data?.isEnabled ?? false],
  });

  cancel() {
    this._dialogRef.close({
      isConfigured: false
    });
  }

  apply() {
    this._dialogRef.close({
      formData: this.form.value,
      isEnabled: this.form.value.isEnabled,
      isConfigured: true
    });
  }
}
