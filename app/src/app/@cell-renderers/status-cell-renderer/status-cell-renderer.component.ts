import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-status-cell-renderer',
  standalone: true,
  imports: [
    TranslocoPipe
  ],
  template: `
    <div class="flex items-center h-full">
      @if (fieldData()?.type === 'published') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-primary
                  font-medium text-on-primary text-xs">{{ fieldData()?.name | transloco }}
        </div>
      } @else if (fieldData()?.type === 'draft') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full border border-border
                  font-medium text-xs">{{ fieldData()?.name | transloco }}
        </div>
      } @else if (fieldData()?.type === 'unpublishedChanges') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-amber-300
                  font-medium text-xs text-amber-950">{{ fieldData()?.name | transloco }}
        </div>
      } @else {
        {{ fieldData() | transloco }}
      }
    </div>
  `,
})
export class StatusCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();
}
