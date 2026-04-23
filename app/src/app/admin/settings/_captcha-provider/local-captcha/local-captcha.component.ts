import { Component, inject, OnInit, signal } from '@angular/core';
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
import { ApiService } from '@services/api.service';

@Component({
  selector: 'app-local-captcha',
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
  ],
  templateUrl: './local-captcha.component.html',
})
export class LocalCaptchaComponent implements OnInit {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);
  private _apiService = inject(ApiService);

  adminKey = signal<string | null>(null);

  form = this._formBuilder.group({
    siteKey: [this._data.siteKey],
    secretKey: [this._data.secretKey],
  });

  ngOnInit() {
    this._apiService
      .get<{ adminKey: string }>('admin/settings/captcha/admin-key')
      .subscribe((res) => {
        this.adminKey.set(res.adminKey);
      });
  }

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
