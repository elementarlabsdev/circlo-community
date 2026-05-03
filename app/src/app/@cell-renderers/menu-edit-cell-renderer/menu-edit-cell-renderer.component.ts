import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-menu-edit-cell-renderer',
  imports: [
    RouterLink
  ],
  templateUrl: './menu-edit-cell-renderer.component.html',
  styleUrl: './menu-edit-cell-renderer.component.scss'
})
export class MenuEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<any>('');
}
