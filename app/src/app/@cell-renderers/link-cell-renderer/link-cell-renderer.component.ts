import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';

@Component({
  selector: 'app-link-cell-renderer',
  standalone: true,
  template: `
    @if (fieldData()) {
      <a [href]="fieldData()" class="text-primary hover:underline" target="_blank">{{ fieldData() }}</a>
    }
  `,
})
export class LinkCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();
}
