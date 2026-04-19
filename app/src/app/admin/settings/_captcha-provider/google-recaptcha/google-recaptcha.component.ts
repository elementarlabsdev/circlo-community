import { Component, inject } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle,
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Button } from '@ngstarter/components/button';
import { TranslocoModule } from '@jsverse/transloco';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-google-recaptcha',
  standalone: true,
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    TranslocoModule,
    Icon,
    Button,
  ],
  templateUrl: './google-recaptcha.component.html',
})
export class GoogleRecaptchaComponent {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    siteKey: [this._data.siteKey],
    secretKey: [this._data.secretKey],
  });

  cancel() {
    this._dialogRef.close();
  }

  apply() {
    this._dialogRef.close({
      formData: this.form.value,
      isConfigured: true,
    });
  }
}
