import { Component, inject, signal } from '@angular/core';
import {
  BreadcrumbsStore
} from '@ngstarter/components/breadcrumbs';
import { AppStore } from '@store/app.store';
import { ActivatedRoute } from '@angular/router';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { TranslateService } from '@services/translate.service';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { ApiService } from '@services/api.service';
import { SnackBar } from '@ngstarter/components/snack-bar';
import { GettingStartedWidget } from '@/dashboard/admin/widgets/getting-started-widget/getting-started-widget';
import {
  PublicationsWidgetComponent
} from '@/dashboard/common/widgets/publications-widget/publications-widget.component';
import { ReactionsWidgetComponent } from '@/dashboard/common/widgets/reactions-widget/reactions-widget.component';
import { ViewsWidgetComponent } from '@/dashboard/common/widgets/views-widget/views-widget.component';
import {
  LatestPublicationsWidget
} from '@/dashboard/admin/widgets/latest-publications-widget/latest-publications-widget';
import { LatestTutorialsWidget } from '@/dashboard/admin/widgets/latest-tutorials-widget/latest-tutorials-widget';
import { ActivityWidgetComponent } from '@/dashboard/admin/widgets/activity-widget/activity-widget.component';
import { Tile, TileHandleDirective, Tiles } from '@ngstarter/components/tiles';
import { Icon } from '@ngstarter/components/icon';
import { ConfirmManager } from '@ngstarter/components/confirm';

export interface DashboardItem {
  id: string;
  w: number;
  h: number;
  wLg?: number;
  wMd?: number;
  widget: any;
  type: string;
  movable: boolean;
  deletable: boolean;
  settingsComponent?: any;
}

@Component({
  imports: [
    PanelContent,
    Panel,
    PanelHeader,
    TranslocoPipe,
    GettingStartedWidget,
    PublicationsWidgetComponent,
    ReactionsWidgetComponent,
    ViewsWidgetComponent,
    LatestPublicationsWidget,
    LatestTutorialsWidget,
    ActivityWidgetComponent,
    Tiles,
    Tile,
    TileHandleDirective,
    Icon,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
  private _route = inject(ActivatedRoute);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _translate = inject(TranslateService);
  private api = inject(ApiService);
  private _snack = inject(SnackBar);
  private _i18n = inject(TranslocoService);
  private _confirmManager = inject(ConfirmManager);

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
        id: 'admin',
        route: '/admin',
        name: this._translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'dashboard',
        name: this._translate.instant('breadcrumbs.dashboard'),
        type: null
      }
    ]);
  }

  layout = signal<DashboardItem[]>([]);
  loaded = signal(false);

  ngOnInit() {
    this.api
      .get('admin/dashboard/layout')
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
      this.api.post('admin/dashboard/layout', { layout }).subscribe({
        next: () =>
          this._snack.open(
            this._i18n.translate('admin.dashboard.layoutSaved'),
            undefined,
            { duration: 2000 }
          ),
      });
    }, 400);
  }

  onLayoutChanged(layout: any[]) {
    this.scheduleLayoutSave(layout);
  }

  removeItem(id: string) {
    this._confirmManager
      .open({
        title: this._i18n.translate('admin.dashboard.confirmDeleteWidget.title'),
        description: this._i18n.translate('admin.dashboard.confirmDeleteWidget.description'),
      })
      .confirmed.subscribe(() => {
        const currentLayout = this.layout();
        const updatedLayout = currentLayout.filter((item) => item.id !== id);

        this.layout.set(updatedLayout);
        this.scheduleLayoutSave(updatedLayout);
      });
  }
}
