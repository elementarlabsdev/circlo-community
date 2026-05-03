import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Button } from '@ngstarter-ui/components/button';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter-ui/components/dialog';
import { Input } from '@ngstarter-ui/components/input';
import { ApiService } from '@services/api.service';
import { FormField, Label } from '@ngstarter-ui/components/form-field';

@Component({
  selector: 'app-ai-api-key',
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    ReactiveFormsModule,
    FormField,
    Label,
  ],
  templateUrl: './ai-api-key.modal.html',
  styleUrl: './ai-api-key.modal.scss'
})
export class AiApiKeyModal {
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(DialogRef);
  private data = inject(DIALOG_DATA);
  private api = inject(ApiService);

  form = this.formBuilder.group({
    apiKey: ['', [Validators.required]]
  });
  loading = signal(false);

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.loading.set(true);
    this.api
      .post(`studio/account/ai-providers/${this.data.provider.id}`, this.form.value)
      .subscribe((res: any) => {
        this.dialogRef.close(res.userAiProvider);
      });
  }
}
