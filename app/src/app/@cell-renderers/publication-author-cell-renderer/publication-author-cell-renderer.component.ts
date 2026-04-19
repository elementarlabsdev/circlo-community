import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Dicebear } from '@ngstarter/components/avatar';
import { Author } from '@model/interfaces';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';

@Component({
  selector: 'app-publication-author-cell-renderer',
  standalone: true,
  imports: [
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './publication-author-cell-renderer.component.html',
  styleUrl: './publication-author-cell-renderer.component.scss'
})
export class PublicationAuthorCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input.required();
  fieldData = input.required<Author>();
}
