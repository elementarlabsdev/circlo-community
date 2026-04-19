import { Component, inject, input, signal } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { RouterLink } from '@angular/router';
import { ApiService } from '@services/api.service';
import { GRID, Grid } from '@ngstarter/components/grid';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Icon } from '@ngstarter/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter/components/card';

@Component({
  selector: 'app-latest-tutorials-widget',
  imports: [
    RouterLink,
    ScrollbarArea,
    Icon,
    Card,
    CardContent,
    CardTitle,
    CardHeader,
    TranslocoModule
  ],
  templateUrl: './latest-tutorials-widget.html',
  styleUrl: './latest-tutorials-widget.scss',
  host: {
    class: 'widget-container'
  }
})
export class LatestTutorialsWidget {
  private _api = inject(ApiService);
  private _dashboard = inject<Grid>(GRID, { optional: true });

  widget = input<any>();
  loaded = signal(false);

  protected tutorials = signal<any[]>([]);

  ngOnInit() {
    this._api
      .get<{ tutorials: any[] }>('studio/dashboard/latest-tutorials')
      .subscribe((res) => {
        this.tutorials.set(res.tutorials);
        this.loaded.set(true);
        // this._dashboard.markWidgetAsLoaded(this.widget()?.id);
      });
  }
}
