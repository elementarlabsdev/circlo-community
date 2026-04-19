import { Component, inject, signal } from '@angular/core';
import { BlockLoader } from '@ngstarter/components/block-loader';
import { Button } from '@ngstarter/components/button';
import { DialogActions, DialogContent, DialogRef, DialogTitle } from '@ngstarter/components/dialog';

@Component({
  selector: 'app-generate-image',
  imports: [
    BlockLoader,
    Button,
    DialogActions,
    DialogContent,
    DialogTitle
  ],
  templateUrl: './generate-image.modal.html',
  styleUrl: './generate-image.modal.scss'
})
export class GenerateImageModal {
  private dialogRef = inject(DialogRef);

  readonly loaded = signal(true);

  cancel() {
    this.dialogRef.close();
  }

  apply() {
    this.dialogRef.close();
  }
}
