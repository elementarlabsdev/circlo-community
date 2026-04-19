import { Component, forwardRef, inject } from '@angular/core';
import { DIALOG_DATA, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';
import { ThreadAdd } from '@app/thread-add/thread-add';
import { ThreadItemComponent } from '@app/thread/thread-item.component';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { Thread } from '@model/interfaces';

export interface ThreadReplyDialogData {
  parentId: string;
  thread: Thread;
}

@Component({
  selector: 'app-thread-reply-dialog',
  standalone: true,
  imports: [
    DialogTitle,
    DialogContent,
    ThreadAdd,
    forwardRef(() => ThreadItemComponent)
  ],
  templateUrl: './thread-reply-dialog.html',
  styleUrl: './thread-reply-dialog.scss',
})
export class ThreadReplyDialogComponent {
  private dialogRef = inject(DialogRef);
  private snackBar = inject(SnackBar);
  data = inject<ThreadReplyDialogData>(DIALOG_DATA);

  onSent() {
    this.snackBar.open('Reply sent!', 'OK', { duration: 3000 });
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
