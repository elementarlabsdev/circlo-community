import { Component, inject } from '@angular/core';
import { DIALOG_DATA, DialogContent, DialogRef, DialogTitle } from '@ngstarter-ui/components/dialog';
import { ThreadAdd } from '@app/thread-add/thread-add';

export interface ThreadDialogData {
  threadId?: string;
}

export type ThreadDialogResult = boolean | undefined;

@Component({
  selector: 'app-thread-dialog',
  standalone: true,
  imports: [
    DialogTitle,
    DialogContent,
    ThreadAdd
  ],
  templateUrl: './thread-dialog.html',
  styleUrl: './thread-dialog.scss',
})
export class ThreadDialogComponent {
  private dialogRef = inject(DialogRef);
  data = inject<ThreadDialogData>(DIALOG_DATA) || {};

  onSent() {
    this.dialogRef.close(true);
  }

  onCancel() {
    this.dialogRef.close();
  }
}
