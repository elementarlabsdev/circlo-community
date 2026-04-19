import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { Input } from '@ngstarter/components/input';
import { FormField, Label } from '@ngstarter/components/form-field';
import { Button } from '@ngstarter/components/button';
import { TextareaAutoSize } from '@ngstarter/components/core';

@Component({
  imports: [
    DialogTitle,
    Button,
    DialogActions,
    Input,
    Label,
    FormField,
    DialogContent,
    ReactiveFormsModule,
    TextareaAutoSize
  ],
  templateUrl: './new.component.html',
  styleUrl: './new.component.scss'
})
export class NewComponent {
  private _formBuilder = inject(FormBuilder);
  private _dialogRef = inject(DialogRef);

  form = this._formBuilder.group({
    name: ['', [Validators.required]],
    description: ['', [Validators.required]]
  });

  ngOnInit() {
  }

  cancel() {
    this._dialogRef.close(false);
  }

  apply(): void {
    this._dialogRef.close(this.form.value);
  }
}
