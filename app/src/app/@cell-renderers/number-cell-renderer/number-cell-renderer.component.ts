import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { DecimalPipe } from '@angular/common';

@Component({
  selector: 'app-number-cell-renderer',
  imports: [
    DecimalPipe
  ],
  templateUrl: './number-cell-renderer.component.html',
  styleUrl: './number-cell-renderer.component.scss'
})
export class NumberCellRendererComponent implements DataViewCellRenderer {
  element = input();
  columnDef = input();
  fieldData = input.required<string>();
}
