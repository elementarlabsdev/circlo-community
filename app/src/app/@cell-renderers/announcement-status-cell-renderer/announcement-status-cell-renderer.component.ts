import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-announcement-status-cell-renderer',
  standalone: true,
  template: `
    <div class="flex items-center h-full">
      @if (fieldData()?.type === 'active') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-green-500/10
                  font-medium text-green-600 text-xs">{{ fieldData()?.name }}
        </div>
      } @else if (fieldData()?.type === 'draft') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full border border-border
                  font-medium text-xs">{{ fieldData()?.name }}
        </div>
      } @else if (fieldData()?.type === 'expired') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-red-500/10
                  font-medium text-xs text-red-600">{{ fieldData()?.name }}
        </div>
      } @else if (fieldData()?.type === 'scheduled') {
        <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-blue-500/10
                  font-medium text-xs text-blue-600">{{ fieldData()?.name }}
        </div>
      } @else {
        {{ fieldData()?.name }}
      }
    </div>
  `,
})
export class AnnouncementStatusCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<any>();
}
