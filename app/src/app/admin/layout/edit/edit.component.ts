import { Component, inject, OnInit, signal } from '@angular/core';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '@services/api.service';
import { Card, CardContent, CardTitle } from '@ngstarter/components/card';
import { DndDraggableDirective, DndDropEvent, DndDropzoneDirective } from 'ngx-drag-drop';
import { Button } from '@ngstarter/components/button';
import { Icon } from '@ngstarter/components/icon';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { TranslateService } from '@services/translate.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  imports: [
    Card,
    CardTitle,
    CardContent,
    DndDraggableDirective,
    DndDropzoneDirective,
    Button,
    Icon,
    CdkDropList,
    CdkDrag,
    CdkDragHandle,
    TranslocoModule
  ],
  templateUrl: './edit.component.html',
  styleUrl: './edit.component.scss'
})
export class EditComponent implements OnInit {
  private _api = inject(ApiService);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);
  private _translate = inject(TranslateService);
  private _route = inject(ActivatedRoute);

  loaded = signal(false);
  layout = signal<any>(null);
  widgets = signal<any[]>([]);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'admin',
        route: '/admin',
        name: this._translate.instant('breadcrumbs.admin'),
        type: 'link'
      },
      {
        id: 'layout',
        name: this._translate.instant('breadcrumbs.admin.layout'),
        type: 'link',
        route: '/admin/layout',
      },
      {
        id: 'layout',
        name: this._translate.instant('breadcrumbs.admin.layout.edit'),
        type: null
      }
    ]);
  }

  ngOnInit() {
    this._api
      .get(`admin/layout/${this._route.snapshot.params['id']}/edit`)
      .subscribe((res: any) => {
        this.layout.set(res.layout);
        this.widgets.set(res.widgets);
        this.loaded.set(true);
      });
  }

  onDrop(event: DndDropEvent, layoutSlot: any) {
    layoutSlot.layoutWidgets.push({
      name: event.data.name,
      type: event.data.type,
      settings: event.data.settings,
      position: layoutSlot.layoutWidgets.length
    });
    this._api
      .post(`admin/layout/${layoutSlot.id}/save`, {
        widgets: layoutSlot.layoutWidgets,
      })
      .subscribe((res: any) => {
      });
  }

  deleteLayoutWidget(list: any[], index: number, layoutSlotId: string) {
    list.splice(index, 1);
    list.forEach((widget: any, index: number) => {
      widget.position = index;
    });
    this._api
      .post(`admin/layout/${layoutSlotId}/save`, {
        widgets: list,
      })
      .subscribe((res: any) => {
      });
  }

  drop(event: CdkDragDrop<any[]>, list: any[], layoutSlotId: string) {
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    list.forEach((widget: any, index: number) => {
      widget.position = index;
    });
    this._api
      .post(`admin/layout/${layoutSlotId}/save`, {
        widgets: list,
      })
      .subscribe((res: any) => {
      });
  }
}
