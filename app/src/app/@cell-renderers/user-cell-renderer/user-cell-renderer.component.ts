import { Component, input, OnInit } from '@angular/core';
import { DataViewCellRenderer } from '@ngstarter-ui/components/data-view';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-user-cell-renderer',
  imports: [
    Dicebear,
    ImageProxyPipe,
    RouterLink
  ],
  template: `
    @if (fieldData()) {
      <a [routerLink]="['/user', fieldData().username]" target="_blank" class="flex gap-2.5 items-center">
        <ngs-dicebear [image]="fieldData().avatarUrl | imageProxy: '100x100,sc,q90'" class="size-9"/>
        {{ fieldData().name }}
      </a>
    }
  `,
})
export class UserCellRenderer implements DataViewCellRenderer, OnInit {
  element = input<any>();
  columnDef = input<any>();
  fieldData = input<any>();

  ngOnInit() {
    // console.log(this.fieldData());
  }
}
