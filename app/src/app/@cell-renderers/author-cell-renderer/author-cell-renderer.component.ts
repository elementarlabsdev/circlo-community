import { Component, input } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Author } from '@model/interfaces';

@Component({
  selector: 'app-author-cell-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './author-cell-renderer.component.html',
  styleUrl: './author-cell-renderer.component.scss'
})
export class AuthorCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input.required();
  fieldData = input.required<Author>();
}
