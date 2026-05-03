import { Component, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { DataViewColumnDef } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-name-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe
  ],
  templateUrl: './name-renderer.html',
  styleUrl: './name-renderer.scss',
})
export class NameRenderer {
  element = input<any>();
  columnDef = input.required<DataViewColumnDef>();
  fieldData = input<any>('');
}
