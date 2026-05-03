import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { DIALOG_DATA, DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { FormField, Hint, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { TranslateService } from '@services/translate.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-hetzner-file-storage-provider',
  imports: [
    ReactiveFormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    SlideToggle,
    Hint,
    TranslocoPipe,
  ],
  templateUrl: './hetzner-file-storage-provider.dialog.html',
  styleUrl: './hetzner-file-storage-provider.dialog.scss'
})
export class HetznerFileStorageProviderDialog {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
  private _api = inject(ApiService);
  private _snackBar = inject(SnackBar);
  private _translateService = inject(TranslateService);

  form = this._formBuilder.group({
    accessKeyId: [this._data?.accessKeyId || '', Validators.required],
    secretAccessKey: [this._data?.secretAccessKey || '', Validators.required],
    bucket: [this._data?.bucket || '', Validators.required],
    region: [this._data?.region || '', Validators.required],
    isEnabled: [this._data?.isEnabled ?? true],
  });

  cancel() {
    this._dialogRef.close();
  }

  apply() {
    if (this.form.invalid) return;
    const payload = this.form.value as any;
    this._api.post('admin/settings/file-storage/provider/hetzner', {
      isEnabled: payload.isEnabled,
      accessKeyId: payload.accessKeyId,
      secretAccessKey: payload.secretAccessKey,
      bucket: payload.bucket,
      region: payload.region,
    }).subscribe({
      next: (res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.hetzner.saved'), '', {
          duration: 2500,
          verticalPosition: 'top'
        });
        this._dialogRef.close({
          isEnabled: payload.isEnabled,
          accessKeyId: payload.accessKeyId,
          secretAccessKey: payload.secretAccessKey,
          bucket: payload.bucket,
          region: payload.region,
          isDefault: res?.provider?.isDefault
        });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.hetzner.failed'), '', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }
}
