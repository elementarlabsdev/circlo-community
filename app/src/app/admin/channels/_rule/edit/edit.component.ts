import { Component, inject } from '@angular/core';
import {
  DIALOG_DATA,
  DialogActions,
  DialogContent,
  DialogRef,
  DialogTitle
} from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Button } from '@ngstarter/components/button';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  selector: 'app-edit',
  imports: [
    Button,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormField,
    Input,
    Label,
    ReactiveFormsModule,
    TextareaAutoSize
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent {
  private _formBuilder = inject(FormBuilder);
  private _dialogRef = inject(DialogRef);
  private _dialogData = inject(DIALOG_DATA);

  form = this._formBuilder.group({
    id: [this._dialogData.id ?? ''],
    name: [this._dialogData.name, [Validators.required]],
    description: [this._dialogData.description, [Validators.required]]
  });

  cancel() {
    this._dialogRef.close(false);
  }

  apply(): void {
    this._dialogRef.close(this.form.value);
  }
}
