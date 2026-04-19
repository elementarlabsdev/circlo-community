import { Component, inject, input, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { GRID, Grid } from '@ngstarter/components/grid';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import {
  Timeline,
  TimelineDescription,
  TimelineItem,
  TimelineTimestamp,
  TimelineTitle
} from '@ngstarter/components/timeline';
import { RouterLink } from '@angular/router';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Icon } from '@ngstarter/components/icon';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter/components/card';

@Component({
  selector: 'app-activity-widget',
  imports: [
    TimeAgoPipe,
    TimelineDescription,
    TimelineTitle,
    TimelineItem,
    Timeline,
    RouterLink,
    ScrollbarArea,
    Icon,
    Card,
    CardContent,
    CardTitle,
    CardHeader
  ],
  templateUrl: './activity-widget.component.html',
  styleUrl: './activity-widget.component.scss',
  host: {
    class: 'widget-container'
  }
})
export class ActivityWidgetComponent {
  private _api = inject(ApiService);
  private _dashboard = inject<Grid>(GRID, { optional: true });

  widget = input<any>();
  loaded = signal(false);

  protected activities = signal<any[]>([]);

  ngOnInit() {
    this._api.get<{ activity: any[] }>('studio/dashboard/activity').subscribe((res) => {
      this.activities.set(res.activity);
      this.loaded.set(true);
      // this._dashboard.markWidgetAsLoaded(this.widget()?.id);
    });
  }
}
