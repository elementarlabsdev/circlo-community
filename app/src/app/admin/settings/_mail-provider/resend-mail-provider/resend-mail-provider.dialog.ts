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
  selector: 'app-resend-mail-provider',
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
  templateUrl: './resend-mail-provider.dialog.html',
  styleUrl: './resend-mail-provider.dialog.scss'
})
export class ResendMailProviderDialog {
  protected dialogRef = inject(DialogRef);
  protected data = inject<any>(DIALOG_DATA);
  private formBuilder = inject(FormBuilder);
  private api = inject(ApiService);
  private snackBar = inject(SnackBar);
  private translateService = inject(TranslateService);

  form = this.formBuilder.group({
    apiKey: [this.data.config?.apiKey, Validators.required],
    isEnabled: [this.data?.isEnabled ?? true],
  });

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    if (this.form.invalid) {
      return;
    }

    const payload = this.form.value as any;
    this.api.post('admin/settings/mail-providers/resend', payload).subscribe({
      next: (res: any) => {
        this.snackBar.open(this.translateService.instant('admin.settings.mail.resend.saved'), '', { duration: 2500 });
        this.dialogRef.close({ ...payload, isDefault: res?.provider?.isDefault });
      },
      error: () => {
        this.snackBar.open(this.translateService.instant('admin.settings.mail.resend.failed'), '', { duration: 3000 });
      }
    });
  }
}
