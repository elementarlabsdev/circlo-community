import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { SnackBar } from '@ngstarter-ui/components/snack-bar';
import { TranslocoService, TranslocoPipe } from '@jsverse/transloco';
import { BreadcrumbsStore } from '@ngstarter-ui/components/breadcrumbs';
import { ConfirmManager } from '@ngstarter-ui/components/confirm';
import { Panel, PanelContent, PanelHeader } from '@ngstarter-ui/components/panel';
import { Button } from '@ngstarter-ui/components/button';
import { Icon } from '@ngstarter-ui/components/icon';
import { StudioChannelsApi } from '../channels.api';

@Component({
  selector: 'studio-channels-list',
  standalone: true,
  imports: [
    TranslocoPipe,
    Panel,
    PanelHeader,
    PanelContent,
    Button,
    Icon,
    RouterLink,
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent {
  private readonly api = inject(StudioChannelsApi);
  private readonly snack = inject(SnackBar);
  private readonly confirmManager = inject(ConfirmManager);
  private readonly breadcrumbsStore = inject(BreadcrumbsStore);
  private readonly translate = inject(TranslocoService);

  channels = signal<any[]>([]);
  loading = signal(true);

  constructor() {
    this.translate.selectTranslate('studio.channels.list.title').subscribe((title) => {
      this.breadcrumbsStore.setBreadcrumbs([
        {
          id: 'home',
          route: '/',
          type: 'link',
          iconName: 'fluent:home-24-regular'
        },
        {
          id: 'studio',
          route: '/studio',
          name: 'studio.menu.dashboard',
          type: 'link'
        },
        {
          id: 'channels',
          name: 'studio.channels.list.title',
          type: null
        }
      ]);
    });
    this.loadChannels();
  }

  loadChannels() {
    this.loading.set(true);
    this.api.getMyChannels().subscribe({
      next: (res) => {
        this.channels.set(res.channels);
        this.loading.set(false);
      },
      error: () => {
        this.snack.open(this.translate.translate('studio.channels.list.loadError'));
        this.loading.set(false);
      }
    });
  }

  deleteChannel(channel: any) {
    const confirmDef = this.confirmManager.open({
      title: this.translate.translate('studio.channels.list.deleteConfirmTitle'),
      description: this.translate.translate('studio.channels.list.deleteConfirmDescription')
    });
    confirmDef.confirmed.subscribe(() => {
      this.api.delete(channel.id).subscribe({
        next: () => {
          this.snack.open(this.translate.translate('studio.channels.list.deleted'));
          this.loadChannels();
        },
        error: () => this.snack.open(this.translate.translate('studio.channels.list.deleteError'))
      });
    });
  }
}
