import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-announcement-type-cell-renderer',
  standalone: true,
  template: `
    <div class="flex items-center h-full">
      <div class="h-6 w-max flex items-center px-2.5 rounded-full bg-primary/10
                font-medium text-primary text-xs">{{ fieldData()?.name }}
      </div>
    </div>
  `,
})
export class AnnouncementTypeCellRenderer implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<any>();
}
