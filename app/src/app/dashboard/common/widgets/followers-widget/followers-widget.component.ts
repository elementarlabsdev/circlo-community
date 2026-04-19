import { Component, inject, input, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GRID, Grid } from '@ngstarter/components/grid';
import { Icon } from '@ngstarter/components/icon';
import { Card, CardContent } from '@ngstarter/components/card';

@Component({
  selector: 'app-followers-widget',
  imports: [
    Icon,
    Card,
    CardContent
  ],
  templateUrl: './followers-widget.component.html',
  styleUrl: './followers-widget.component.scss',
  host: {
    class: 'widget-container'
  }
})
export class FollowersWidgetComponent {
  private _api = inject(ApiService);
  private _dashboard = inject<Grid>(GRID, { optional: true });

  widget = input<any>();
  loaded = signal(false);

  protected data = signal<any>(null);

  ngOnInit() {
    this._api.get('studio/dashboard/followers').subscribe((res) => {
      this.data.set(res);
      this.loaded.set(true);
      // this._dashboard.markWidgetAsLoaded(this.widget()?.id);
    });
  }
}
