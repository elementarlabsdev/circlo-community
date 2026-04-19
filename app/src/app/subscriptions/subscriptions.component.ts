import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { Pagination } from '@model/interfaces';
import { ChannelComponent } from '@app/channel/channel.component';
import { TopicComponent } from '@app/topic/topic.component';
import { PaginatorComponent } from '@app/paginator';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    ChannelComponent,
    TopicComponent,
    PaginatorComponent,
    TranslocoPipe
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent implements OnInit {
  private _api = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);

  loading = signal(true);
  items = signal<any[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;

  ngOnInit() {
    this._load();
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this.loading.set(true);
    this._api
      .get('subscriptions', {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.items.set(res.items);
        this.pagination.set(res.pagination);
        this.loading.set(false);
      })
    ;
  }
}
