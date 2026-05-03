import { Component, Inject } from '@angular/core';
import { DIALOG_DATA, DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { Button } from '@ngstarter-ui/components/button';
import { TranslocoPipe } from '@jsverse/transloco';

export interface ConfirmDialogData {
  title?: string; // i18n key
  message: string; // i18n key
  confirmLabel?: string; // i18n key
  cancelLabel?: string; // i18n key
  color?: 'primary' | 'accent' | 'warn';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [DialogTitle, DialogContent, DialogActions, Button, TranslocoPipe],
  template: `
    <h2 ngs-dialog-title>{{ data.title || 'confirm' | transloco }}</h2>
    <div ngs-dialog-content>
      {{ data.message | transloco }}
    </div>
    <div ngs-dialog-actions align="end">
      <button ngsButton="outlined" (click)="close(false)">{{ data.cancelLabel || 'editor.buttonCancelLabel' | transloco }}</button>
      <button ngsButton="filled" (click)="close(true)">{{ data.confirmLabel || 'confirm' | transloco }}</button>
    </div>
  `,
})
export class ConfirmDialogComponent {
  constructor(
    private _dialogRef: DialogRef<ConfirmDialogComponent, boolean>,
    @Inject(DIALOG_DATA) public data: ConfirmDialogData,
  ) {}

  close(result: boolean) {
    this._dialogRef.close(result);
  }
}
