import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';

@Component({
  selector: 'app-date-cell',
  standalone: true,
  imports: [
    TimeAgoPipe
  ],
  templateUrl: './date-cell.renderer.html',
  styleUrl: './date-cell.renderer.scss'
})
export class DateCellRenderer implements DataViewCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input<string>('');
}
