import { Component, inject, input } from '@angular/core';
import { DATA_VIEW, DataViewCellRenderer } from '@ngstarter/components/data-view';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { Tooltip } from '@ngstarter/components/tooltip';

@Component({
  selector: 'app-admin-roles-actions-cell-renderer',
  standalone: true,
  imports: [
    RouterLink,
    Button,
    Icon,
    Tooltip
  ],
  template: `
    <div class="flex gap-2">
      <a [routerLink]="['/admin/roles', element().id, 'edit']" ngsIconButton ngsTooltip="Edit">
        <ngs-icon name="fluent:edit-24-regular"/>
      </a>
      <button ngsIconButton ngsTooltip="Delete" [disabled]="element().isBuiltIn" (click)="delete()">
        <ngs-icon name="fluent:delete-24-regular"/>
      </button>
    </div>
  `
})
export class AdminRolesActionsCellRendererComponent implements DataViewCellRenderer {
  private dataView = inject(DATA_VIEW);

  element = input<any>();
  columnDef = input<any>();
  fieldData = input<string>('');

  delete() {
    this.columnDef().params?.onDelete(this.element(), this.dataView.api);
  }
}
