import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-announcement-actions-cell-renderer',
  standalone: true,
  imports: [
    Button,
    Icon,
    TranslocoPipe
  ],
  template: `
    <div class="flex items-center gap-0.5 h-full">
      <button ngsButton (click)="onEdit()">
        <ngs-icon name="fluent:edit-24-regular"/>{{ 'table.action.edit' | transloco }}
      </button>
      <button ngsIconButton (click)="onDelete()">
        <ngs-icon name="fluent:delete-24-regular"/>
      </button>
    </div>
  `,
})
export class AnnouncementActionsCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();

  onEdit() {
    this.columnDef().params.onEdit(this.element());
  }

  onDelete() {
    this.columnDef().params.onDelete(this.element());
  }
}
