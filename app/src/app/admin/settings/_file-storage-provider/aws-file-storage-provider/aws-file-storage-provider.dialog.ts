import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter/components/button';
import { DIALOG_DATA, DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Input } from '@ngstarter/components/input';
import { SlideToggle } from '@ngstarter/components/slide-toggle';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { TranslateService } from '@services/translate.service';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-aws-file-storage-provider',
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
    TranslocoPipe,
  ],
  templateUrl: './aws-file-storage-provider.dialog.html',
  styleUrl: './aws-file-storage-provider.dialog.scss'
})
export class AwsFileStorageProviderDialog {
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
    useAcl: [this._data?.useAcl ?? true],
  });

  cancel() {
    this._dialogRef.close();
  }

  apply() {
    if (this.form.invalid) return;
    const payload = this.form.value as any;
    this._api.post('admin/settings/file-storage/provider/aws-s3', {
      isEnabled: payload.isEnabled,
      useAcl: payload.useAcl,
      accessKeyId: payload.accessKeyId,
      secretAccessKey: payload.secretAccessKey,
      bucket: payload.bucket,
      region: payload.region,
    }).subscribe({
      next: (res: any) => {
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.aws.saved'), '', {
          duration: 2500,
          verticalPosition: 'top'
        });
        this._dialogRef.close({
          isEnabled: payload.isEnabled,
          useAcl: payload.useAcl,
          accessKeyId: payload.accessKeyId,
          secretAccessKey: payload.secretAccessKey,
          bucket: payload.bucket,
          region: payload.region,
          isDefault: res?.provider?.isDefault
        });
      },
      error: () => {
        this._snackBar.open(this._translateService.instant('admin.settings.fileStorage.aws.failed'), '', {
          duration: 3000,
          verticalPosition: 'top'
        });
      }
    });
  }
}
