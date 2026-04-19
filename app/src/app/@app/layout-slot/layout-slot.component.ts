import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { WIDGETS } from '@/types';
import { ApiService } from '@services/api.service';
import { AsyncPipe, NgComponentOutlet } from '@angular/common';

@Component({
  selector: 'app-layout-slot',
  imports: [
    AsyncPipe,
    NgComponentOutlet
  ],
  templateUrl: './layout-slot.component.html',
  styleUrl: './layout-slot.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    'class': 'layout-slot'
  }
})
export class LayoutSlotComponent implements OnInit {
  private _api = inject(ApiService);
  private _widgets = inject<{[prop: string]: any}>(WIDGETS, { optional: true }) || {};

  slotType = input.required<string>();
  widgets = signal<any[]>([]);
  position = input<'start' | 'none' | 'end'>('none');

  ngOnInit() {
    this._api
      .get(`layout/slot/${this.slotType()}/widgets`)
      .subscribe((res: any) => {
        this.widgets.set(res.widgets);
      })
    ;
  }

  getWidgetComponent(type: string) {
    return this._widgets[type];
  }
}
