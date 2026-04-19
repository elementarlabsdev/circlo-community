import { Component, inject, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { Channel, Pagination } from '@model/interfaces';
import { PaginatorComponent } from '@app/paginator';
import { ChannelComponent } from '@app/channel/channel.component';
import { ChannelSkeletonComponent } from '@app/channel-skeleton/channel-skeleton.component';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-channels',
  standalone: true,
  imports: [
    PaginatorComponent,
    ChannelComponent,
    ChannelSkeletonComponent,
    TranslocoPipe
  ],
  templateUrl: './channels.component.html',
  styleUrl: './channels.component.scss'
})
export class ChannelsComponent {
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);

  loaded = signal(false);
  channels = signal<Channel[]>([]);
  loading = signal(true);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  loadingChannels = [1, 2, 3, 4, 5, 6];
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;

  ngOnInit() {
    this._load();
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this.loaded.set(false);
    this._apiService
      .get('channels', {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this.channels.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
      })
    ;
  }
}
