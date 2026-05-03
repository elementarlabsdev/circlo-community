import { Component, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { RouterLink } from '@angular/router';
import { DataViewColumnDef } from '@ngstarter-ui/components/data-view';

@Component({
  selector: 'app-user-name-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe,
    RouterLink
  ],
  templateUrl: './user-name-renderer.html',
  styleUrl: './user-name-renderer.scss',
})
export class UserNameRenderer {
  element = input<any>();
  columnDef = input.required<DataViewColumnDef>();
  fieldData = input<any>('');
}
