import { Component, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import { DIALOG_DATA, DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { FormField, Label } from '@ngstarter-ui/components/form-field';
import { Input } from '@ngstarter-ui/components/input';
import { SlideToggle } from '@ngstarter-ui/components/slide-toggle';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'app-github-oauth-provider',
  standalone: true,
  imports: [
    FormsModule,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    SlideToggle,
    TranslocoModule,
  ],
  templateUrl: './github-provider.component.html',
  styleUrl: './github-provider.component.scss'
})
export class GithubOauthProviderComponent {
  protected _dialogRef = inject(DialogRef);
  protected _data = inject<any>(DIALOG_DATA);
  private _formBuilder = inject(FormBuilder);

  form = this._formBuilder.group({
    clientId: [this._data?.clientId || '', Validators.required],
    clientSecret: [this._data?.clientSecret || '', Validators.required],
    isEnabled: [this._data?.isEnabled ?? true],
  });

  cancel() {
    this._dialogRef.close({ isConfigured: false });
  }

  apply() {
    this._dialogRef.close({
      formData: {
        clientId: this.form.value.clientId,
        clientSecret: this.form.value.clientSecret,
      },
      isEnabled: this.form.value.isEnabled,
      isConfigured: true,
    });
  }
}
