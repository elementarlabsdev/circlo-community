import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '@services/api.service';
import { AppStore } from '@store/app.store';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { Icon } from '@ngstarter/components/icon';
import { ImageDesignCard } from '@/studio/image-designer/image-design-card/image-design-card';
import {
  EmptyState,
  EmptyStateContent,
  EmptyStateIcon
} from '@ngstarter/components/empty-state';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { PanelContent, Panel, PanelHeader } from '@ngstarter/components/panel';
import { ScrollbarArea } from '@ngstarter/components/scrollbar-area';
import { Button } from '@ngstarter/components/button';
import { ConfirmManager } from '@ngstarter/components/confirm';

@Component({
  selector: 'app-list',
  imports: [
    Icon,
    ImageDesignCard,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    ScrollbarArea,
    Button,
  ],
  templateUrl: './list.html',
  styleUrl: './list.scss',
})
export class List implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private api = inject(ApiService);
  private appStore = inject(AppStore);
  private breadcrumbsStore = inject(BreadcrumbsStore);
  private confirmManager = inject(ConfirmManager);
  private translocoService = inject(TranslocoService);

  loaded = signal(false);
  imageDesigns = signal<any[]>([]);

  constructor() {
    this.appStore.setTitle(this.route.snapshot.title || '');
    this.breadcrumbsStore.setBreadcrumbs([
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
        name: 'breadcrumbs.coverEditor',
        id: 'coverEditor',
        type: null
      }
    ]);
  }

  ngOnInit() {
    this.api
      .get('studio/image-designs')
      .subscribe((res: any) => {
        this.imageDesigns.set(res || []);
        this.loaded.set(true);
      });
  }

  addImageDesign() {
    this.api.post('studio/image-designs', {}).subscribe((res: any) => {
      this.router.navigate(['/studio/image-designer', res.id, 'edit']);
    });
  }

  edit(imageDesign: any) {
    this.router.navigate(['/studio/image-designer', imageDesign.id, 'edit']);
  }

  delete(imageDesign: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translocoService.translate('studio.coverEditor.deleteConfirmTitle'),
      description: this.translocoService.translate('studio.coverEditor.deleteConfirmDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api
        .delete(`studio/image-designs/${imageDesign.id}`)
        .subscribe(() => {
          this.imageDesigns.update(designs => designs.filter(d => d.id !== imageDesign.id));
        });
    });
  }
}
