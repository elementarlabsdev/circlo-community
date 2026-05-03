import { Component, inject, input, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { RouterLink } from '@angular/router';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { Icon } from '@ngstarter-ui/components/icon';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardContent, CardHeader, CardTitle } from '@ngstarter-ui/components/card';

@Component({
  selector: 'app-latest-publications-widget',
  imports: [
    RouterLink,
    ScrollbarArea,
    Icon,
    TranslocoPipe,
    Card,
    CardContent,
    CardHeader,
    CardTitle
  ],
  templateUrl: './latest-publications-widget.html',
  styleUrl: './latest-publications-widget.scss',
  host: {
    class: 'widget-container'
  }
})
export class LatestPublicationsWidget {
  private _api = inject(ApiService);

  widget = input<any>();
  loaded = signal(false);
  publications = signal<any[]>([]);

  ngOnInit() {
    this._api
      .get<{ publications: any[] }>('studio/dashboard/latest-publications')
      .subscribe((res) => {
        this.publications.set(res.publications);
        this.loaded.set(true);
      });
  }
}
