import { Component, inject, signal } from '@angular/core';
import { Button } from '@ngstarter/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '@services/api.service';
import { FormField, Label } from '@ngstarter/components/form-field';

@Component({
  selector: 'app-edit-user-provider',
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
  ],
  templateUrl: './edit-user-provider.modal.html',
  styleUrl: './edit-user-provider.modal.scss'
})
export class EditUserProviderModal {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(DialogRef);
  private data = inject(DIALOG_DATA);
  private api = inject(ApiService);

  form = this.formBuilder.group({
    apiKey: [this.data.userProvider.apiKey, [Validators.required]]
  });
  loading = signal(false);

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.loading.set(true);
    this.api
      .post(`studio/account/ai-providers/user-provider/${this.data.userProvider.id}`, this.form.value)
      .subscribe((res: any) => {
        this.dialogRef.close(res.userAiProvider);
      });
  }
}
