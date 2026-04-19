import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-user-status-cell-renderer',
  imports: [TranslocoPipe],
  templateUrl: './user-status-cell-renderer.component.html',
  styleUrl: './user-status-cell-renderer.component.scss'
})
export class UserStatusCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input.required<boolean>();
}
