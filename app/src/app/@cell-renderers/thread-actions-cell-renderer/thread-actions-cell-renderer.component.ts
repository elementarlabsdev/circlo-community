import { Component, inject, input } from '@angular/core';
import { DATA_VIEW, DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-thread-actions-cell-renderer',
  standalone: true,
  imports: [
    Button,
    Icon,
    TranslocoPipe
  ],
  template: `
    <div class="flex items-center gap-0.5 h-full">
      @if (columnDef().params?.onView) {
        <button ngsIconButton (click)="view()">
          <ngs-icon name="fluent:eye-24-regular"/>
        </button>
      }
      @if (columnDef().params?.onEdit) {
        <button ngsButton (click)="edit()">
          <ngs-icon name="fluent:edit-24-regular"/>{{ 'table.action.edit' | transloco }}
        </button>
      }
      @if (columnDef().params?.onDelete) {
        <button ngsIconButton (click)="delete()">
          <ngs-icon name="fluent:delete-24-regular"/>
        </button>
      }
    </div>
  `,
})
export class ThreadActionsCellRenderer implements DataViewCellRenderer {
  private dataView = inject(DATA_VIEW);

  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();

  view() {
    this.columnDef().params?.onView(this.element(), this.dataView.api);
  }

  edit() {
    this.columnDef().params?.onEdit(this.element(), this.dataView.api);
  }

  delete() {
    this.columnDef().params?.onDelete(this.element(), this.dataView.api);
  }
}
