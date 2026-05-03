import { Component, inject, input, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GRID, Grid } from '@ngstarter-ui/components/grid';
import { Icon } from '@ngstarter-ui/components/icon';
import { Card, CardContent } from '@ngstarter-ui/components/card';

@Component({
  selector: 'app-reactions-widget',
  imports: [
    Icon,
    Card,
    CardContent
  ],
  templateUrl: './reactions-widget.component.html',
  styleUrl: './reactions-widget.component.scss',
  host: {
    class: 'widget-container'
  }
})
export class ReactionsWidgetComponent {
  private _api = inject(ApiService);
  private _dashboard = inject<Grid>(GRID, { optional: true });

  widget = input<any>();
  loaded = signal(false);

  protected data = signal<any>(null);

  ngOnInit() {
    this._api.get('studio/dashboard/reactions').subscribe((res) => {
      this.data.set(res);
      this.loaded.set(true);
      // this._dashboard.markWidgetAsLoaded(this.widget()?.id);
    });
  }
}
