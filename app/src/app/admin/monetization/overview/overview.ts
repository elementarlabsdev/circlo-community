import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { TranslateService } from '@services/translate.service';
import { ApiService } from '@services/api.service';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { ScrollbarArea } from '@ngstarter-ui/components/scrollbar-area';
import { TranslocoPipe } from '@jsverse/transloco';
import { Card, CardContent, CardHeader } from '@ngstarter-ui/components/card';
import { Icon } from '@ngstarter-ui/components/icon';
import { RouterLink } from '@angular/router';
import { Button } from '@ngstarter-ui/components/button';
import { AppStore } from '@store/app.store';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    TranslocoPipe,
    Card,
    CardContent,
    CardHeader,
    Icon,
    RouterLink,
    Button
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview implements OnInit {
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslateService);
  private readonly api = inject(ApiService);
  private readonly appStore = inject(AppStore);

  settings = signal<any>(null);
  loaded = signal(false);
  monetizationCreditsEnabled = computed(() => this.appStore.monetizationCreditsEnabled());

  constructor() {
    this.breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: '',
        route: '/admin/monetization',
        name: this.translate.instant('breadcrumbs.monetization'),
        type: 'link'
      },
      {
        id: '',
        route: '/admin/monetization/overview',
        name: this.translate.instant('breadcrumbs.monetization.overview'),
        type: null
      },
    ]);
  }

  ngOnInit() {
    this.api.get('admin/settings/monetization').subscribe((res: any) => {
      this.settings.set(res);
      this.loaded.set(true);
    });
  }
}
