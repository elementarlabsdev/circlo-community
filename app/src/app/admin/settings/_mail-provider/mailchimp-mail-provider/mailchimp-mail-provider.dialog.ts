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
import { FormField, Hint, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { TranslateService } from '@services/translate.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-mailchimp-mail-provider',
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Hint,
    Input,
    Label,
    SlideToggle,
    ReactiveFormsModule,
    TranslocoPipe
  ],
  templateUrl: './mailchimp-mail-provider.dialog.html',
  styleUrl: './mailchimp-mail-provider.dialog.scss'
})
export class MailchimpMailProviderDialog {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    apiKey: [this._data?.config?.apiKey, Validators.required],
    isEnabled: [this._data?.isEnabled ?? true],
  });

  cancel() {
    this._dialogRef.close();
  }

  apply() {
    if (this.form.invalid) return;
    const payload = this.form.value as any;
    this._api.post('admin/settings/mail-providers/mailchimp', payload).subscribe({
      next: (res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.mail.mailchimp.saved'), '', { duration: 2500 });
        this._dialogRef.close({ ...payload, isDefault: res?.provider?.isDefault });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.mail.mailchimp.failed'), '', { duration: 3000 });
      }
    });
  }
}
