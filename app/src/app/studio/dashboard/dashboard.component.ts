import { Component, inject, OnInit, signal } from '@angular/core';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import { ActivatedRoute } from '@angular/router';
import { Icon } from '@ngstarter/components/icon';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { ApiService } from '@services/api.service';
import {
  PublicationsWidgetComponent
} from '@/dashboard/common/widgets/publications-widget/publications-widget.component';
import { FollowersWidgetComponent } from '@/dashboard/common/widgets/followers-widget/followers-widget.component';
import { ReactionsWidgetComponent } from '@/dashboard/common/widgets/reactions-widget/reactions-widget.component';
import { ViewsWidgetComponent } from '@/dashboard/common/widgets/views-widget/views-widget.component';
import {
  LatestPublicationsWidget
} from '@/dashboard/studio/widgets/latest-publications-widget/latest-publications-widget';
import { LatestTutorialsWidget } from '@/dashboard/studio/widgets/latest-tutorials-widget/latest-tutorials-widget';
import { Tile, TileHandleDirective, Tiles } from '@ngstarter/components/tiles';
import { ActivityWidgetComponent } from '@/dashboard/studio/widgets/activity-widget/activity-widget.component';

export interface DashboardItem {
  w: number;
  h: number;
  wLg?: number;
  wMd?: number;
  widget: any;
  type: string;
  resizable: boolean;
  settingsComponent?: any;
}

@Component({
  standalone: true,
  imports: [
    Icon,
    Panel,
    PanelHeader,
    PanelContent,
    TranslocoPipe,
    PublicationsWidgetComponent,
    FollowersWidgetComponent,
    ReactionsWidgetComponent,
    ViewsWidgetComponent,
    LatestPublicationsWidget,
    LatestTutorialsWidget,
    ActivityWidgetComponent,
    LatestPublicationsWidget,
    LatestTutorialsWidget,
    Tile,
    TileHandleDirective,
    Tiles,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private api = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _snack = inject(SnackBar);
  private _i18n = inject(TranslocoService);

  layout = signal<DashboardItem[]>([]);
  loaded = signal(false);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.dashboard',
        id: 'dashboard',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.api
      .get('studio/dashboard/layout')
      .subscribe((res: any) => {
        this.layout.set(res.layout);
        this.loaded.set(true);
      });
  }

  private _saveTimer: any = null;
  private scheduleLayoutSave(layout: DashboardItem[]) {
    if (this._saveTimer) {
      clearTimeout(this._saveTimer);
    }
    // Debounce to avoid excessive requests during drag/resize
    this._saveTimer = setTimeout(() => {
      this.api.post('studio/dashboard/layout', { layout }).subscribe({
        next: () =>
          this._snack.open(
            this._i18n.translate('studio.dashboard.layoutSaved'),
            undefined,
            { duration: 2000 }
          ),
      });
    }, 400);
  }

  onOrderChanged(newLayout: DashboardItem[]) {
    this.scheduleLayoutSave(newLayout);
  }
}
