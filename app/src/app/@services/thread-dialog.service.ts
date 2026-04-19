import { inject, Injectable } from '@angular/core';
import { Dialog } from '@ngstarter/components/dialog';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { TranslocoService } from '@jsverse/transloco';
import { Thread } from '@model/interfaces';
import { ThreadReplyDialogComponent } from '@modals/thread-reply-dialog/thread-reply-dialog';
import { filter } from 'rxjs/operators';
import { Observable, Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreadDialogService {
  private _dialog = inject(Dialog);
  private _snack = inject(SnackBar);
  private _transloco = inject(TranslocoService);

  openReplyDialog(thread: Thread): Observable<boolean> {
    const dialogRef = this._dialog.open(ThreadReplyDialogComponent, {
      width: '800px',
      maxWidth: '800px',
      data: {
        parentId: thread.id,
        thread: {
          ...thread,
          replies: []
        }
      }
    });
    return dialogRef.afterClosed().pipe(
      filter((result): result is boolean => !!result)
    );
  }
}
