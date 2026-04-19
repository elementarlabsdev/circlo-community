import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Publication } from '@model/interfaces';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-in-response-to-cell-renderer',
  imports: [
    RouterLink
  ],
  templateUrl: './in-response-to-cell-renderer.component.html',
  styleUrl: './in-response-to-cell-renderer.component.scss'
})
export class InResponseToCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input.required();
  fieldData = input.required<Publication>();
}
