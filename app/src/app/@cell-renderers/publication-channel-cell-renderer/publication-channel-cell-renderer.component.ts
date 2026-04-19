import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter/components/data-view';
import { Dicebear } from '@ngstarter/components/avatar';
import { Channel } from '@model/interfaces';
import { ImageProxyPipe } from '../../pipes/image-proxy.pipe';

@Component({
  selector: 'app-publication-channel-cell-renderer',
  standalone: true,
  imports: [
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './publication-channel-cell-renderer.component.html',
  styleUrl: './publication-channel-cell-renderer.component.scss'
})
export class PublicationChannelCellRendererComponent implements DataViewCellRenderer {
  element = input.required<any>();
  columnDef = input.required();
  fieldData = input.required<Channel>();
}
