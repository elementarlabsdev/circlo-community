import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publication-view-cell-renderer',
  standalone: true,
  imports: [
    RouterLink
  ],
  templateUrl: './publication-view-cell-renderer.component.html',
  styleUrl: './publication-view-cell-renderer.component.scss'
})
export class PublicationViewCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
