import { Component, inject, input, signal } from '@angular/core';
import { GRID, Grid } from '@ngstarter/components/grid';
import { ApiService } from '@services/api.service';
import { Icon } from '@ngstarter/components/icon';
import { Card, CardContent } from '@ngstarter/components/card';

@Component({
  selector: 'app-publications-widget',
  imports: [
    Icon,
    Card,
    CardContent
  ],
  templateUrl: './publications-widget.component.html',
  styleUrl: './publications-widget.component.scss',
  host: {
    class: 'widget-container'
  }
})
export class PublicationsWidgetComponent {
  private _api = inject(ApiService);
  private _dashboard = inject<Grid>(GRID, { optional: true });

  widget = input<any>();
  loaded = signal(false);

  protected data = signal<any>(null);

  ngOnInit() {
    this._api.get('studio/dashboard/publications').subscribe((res) => {
      this.data.set(res);
      this.loaded.set(true);
      // this._dashboard.markWidgetAsLoaded(this.widget()?.id);
    });
  }
}
