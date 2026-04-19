import { Component, inject } from '@angular/core';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { Button } from '@ngstarter/components/button';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-danger-zone-confirm-dialog',
  standalone: true,
  imports: [DialogContent, DialogTitle, DialogActions, Button, TranslocoPipe],
  template: `
    <h2 ngs-dialog-title>{{ 'dangerZone' | transloco }}</h2>
    <div ngs-dialog-content>
      {{ 'studio.dangerZone.confirmDeactivate' | transloco }}
    </div>
    <div ngs-dialog-actions align="end">
      <button ngsButton="outlined" (click)="close(false)">{{ 'editor.buttonCancelLabel' | transloco }}</button>
      <button color="warn" ngsButton="filled" (click)="close(true)">{{ 'deactivate' | transloco }}</button>
    </div>
  `,
})
export class DangerZoneConfirmDialogComponent {
  private _dialogRef = inject(DialogRef<DangerZoneConfirmDialogComponent, boolean>);

  close(result: boolean) {
    this._dialogRef.close(result);
  }
}
