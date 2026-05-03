import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-edit-cell-renderer',
  imports: [
    RouterLink
  ],
  templateUrl: './page-edit-cell-renderer.component.html',
  styleUrl: './page-edit-cell-renderer.component.scss'
})
export class PageEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
