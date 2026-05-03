import { Component, inject, input } from '@angular/core';
import { DATA_VIEW, DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-common-actions-cell-renderer',
  standalone: true,
  imports: [
    Button,
    Icon,
    TranslocoPipe
  ],
  template: `
    <div class="flex items-center gap-0.5 h-full">
      @if (columnDef().params?.onView) {
        <button ngsButton (click)="view()">
          <ngs-icon name="fluent:eye-24-regular"/>{{ 'table.action.view' | transloco }}
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
export class CommonActionsCellRenderer implements DataViewCellRenderer {
  private dataView = inject(DATA_VIEW);

  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();

  view() {
    this.columnDef().params?.onView(this.element(), this.dataView.api);
  }

  delete() {
    this.columnDef().params?.onDelete(this.element(), this.dataView.api);
  }
}
