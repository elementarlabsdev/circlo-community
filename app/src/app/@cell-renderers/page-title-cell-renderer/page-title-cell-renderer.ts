import { Component, input } from '@angular/core';
import { DataViewColumnDef } from '@ngstarter/components/data-view';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-title-cell-renderer',
  imports: [
    RouterLink
  ],
  templateUrl: './page-title-cell-renderer.html',
  styleUrl: './page-title-cell-renderer.scss',
})
export class PageTitleCellRenderer {
  element = input<any>();
  columnDef = input.required<DataViewColumnDef>();
  fieldData = input<any>('');
}
