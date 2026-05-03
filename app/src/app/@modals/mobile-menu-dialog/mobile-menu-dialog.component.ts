import { Component, inject } from '@angular/core';
import { DialogRef } from '@ngstarter-ui/components/dialog';
import { Sidebar } from '@app/sidebar/sidebar/sidebar.component';

@Component({
  selector: 'app-mobile-menu-dialog',
  standalone: true,
  imports: [
    Sidebar
  ],
  template: `
    <div class="h-full flex flex-col">
      <div class="flex items-center justify-between px-4 py-2 border-b border-b-border">
        <h2 h3 class="m-0">Menu</h2>
        <button (click)="close()" class="p-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="grow overflow-y-auto">
        <app-sidebar />
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--background);
    }
    ::ng-deep app-sidebar .inner {
        width: 100% !important;
    }
    ::ng-deep app-sidebar {
        height: auto !important;
        padding: 1rem !important;
    }
  `]
})
export class MobileMenuDialogComponent {
  private dialogRef = inject(DialogRef);

  close() {
    this.dialogRef.close();
  }
}
