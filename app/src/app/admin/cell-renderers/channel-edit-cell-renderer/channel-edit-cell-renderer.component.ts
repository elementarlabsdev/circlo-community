import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-channel-edit-cell-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe,
    RouterLink
  ],
  templateUrl: './channel-edit-cell-renderer.component.html',
  styleUrl: './channel-edit-cell-renderer.component.scss'
})
export class ChannelEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
