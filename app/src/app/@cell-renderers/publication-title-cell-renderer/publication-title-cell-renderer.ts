import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-publication-title-cell-renderer',
  imports: [
    RouterLink
  ],
  templateUrl: './publication-title-cell-renderer.html',
  styleUrl: './publication-title-cell-renderer.scss',
})
export class PublicationTitleCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
