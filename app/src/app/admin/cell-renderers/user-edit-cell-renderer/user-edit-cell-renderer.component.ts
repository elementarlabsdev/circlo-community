import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Dicebear } from '@ngstarter/components/avatar';
import { ImageProxyPipe } from '../../../pipes/image-proxy.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-edit-cell-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe,
    RouterLink
  ],
  templateUrl: './user-edit-cell-renderer.component.html',
  styleUrl: './user-edit-cell-renderer.component.scss'
})
export class UserEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<any>('');
}
