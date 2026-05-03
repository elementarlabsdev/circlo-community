import { Component, inject } from '@angular/core';
import { DialogRef } from '@ngstarter-ui/components/dialog';
import { AssistantSearchComponent } from '@app/header/_assistant-search/assistant-search.component';

@Component({
  selector: 'app-search-dialog',
  standalone: true,
  imports: [
    AssistantSearchComponent
  ],
  template: `
    <div class="p-4 w-full max-w-2xl mx-auto">
      <app-assistant-search />
    </div>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class SearchDialogComponent {
  private dialogRef = inject(DialogRef);

  close() {
    this.dialogRef.close();
  }
}
