import { Injectable, inject } from '@angular/core';
import { Dialog } from '@ngstarter-ui/components/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../@shared/confirm-dialog.component';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  width?: string;
  color?: 'primary' | 'accent' | 'warn';
}

@Injectable({ providedIn: 'root' })
export class ConfirmationManager {
  private _dialog = inject(Dialog);

  confirm(options: ConfirmationOptions): Observable<boolean> {
    const data: ConfirmDialogData = {
      title: options.title ?? 'dangerZone',
      message: options.message,
      confirmLabel: options.confirmLabel ?? 'deactivate',
      cancelLabel: options.cancelLabel ?? 'editor.buttonCancelLabel',
      color: options.color ?? 'warn',
    };

    const ref = this._dialog.open(ConfirmDialogComponent, {
      width: options.width ?? '480px',
      data,
    });

    return ref.afterClosed();
  }
}
