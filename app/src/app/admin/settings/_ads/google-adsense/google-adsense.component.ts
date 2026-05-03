import { Component, inject } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Button } from '@ngstarter-ui/components/button';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-google-adsense',
  imports: [
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
  templateUrl: './google-adsense.component.html',
  styleUrl: './google-adsense.component.scss'
})
export class GoogleAdsenseComponent {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    googleAdsensePubId: [this._data.googleAdsensePubId, Validators.required],
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
