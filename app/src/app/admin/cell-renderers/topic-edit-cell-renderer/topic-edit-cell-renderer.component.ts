import { Component, input } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { RouterLink } from '@angular/router';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';

@Component({
  selector: 'app-topic-edit-cell-renderer',
  standalone: true,
  imports: [
    RouterLink,
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './topic-edit-cell-renderer.component.html',
  styleUrl: './topic-edit-cell-renderer.component.scss'
})
export class TopicEditCellRendererComponent implements DataViewCellRenderer {
  element = input<any>();
  columnDef = input();
  fieldData = input<string>('');
}
