import { Component, inject } from '@angular/core';
import { DialogRef, DialogContent, DialogTitle, DialogActions } from '@ngstarter/components/dialog';
import { Button } from '@ngstarter/components/button';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-provider-picker-dialog',
  standalone: true,
  imports: [DialogContent, DialogTitle, DialogActions, Button, TranslocoPipe],
  templateUrl: './provider-picker.dialog.html',
  styleUrl: './provider-picker.dialog.scss'
})
export class ProviderPickerDialog {
  protected _dialogRef = inject(DialogRef);
  providers: any[] = [];

  constructor() {
    // We expect parent to set the providers via componentInstance after open.
  }

  close() {
    this._dialogRef.close();
  }

  choose(provider: any) {
    this._dialogRef.close(provider);
  }

  edit(provider: any) {
    this._dialogRef.close({ ...provider, action: 'edit' });
  }
}
