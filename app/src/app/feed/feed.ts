import { Component, inject, signal, DestroyRef, NgZone } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ApiService } from '@services/api.service';
import { SettingsService } from '@services/settings.service';
import { WebSocketService } from '@services/web-socket.service';
import { ActivatedRoute } from '@angular/router';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { Pagination, FeedItem } from '@model/interfaces';
import { PaginatorComponent } from '@app/paginator';
import { PublicationSkeletonComponent } from '@app/publication-skeleton/publication-skeleton.component';
import { TranslocoPipe } from '@jsverse/transloco';
import { FeedItems } from '@app/feed-items/feed-items';
import { ThreadAdd } from '@app/thread-add/thread-add';

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [
    PaginatorComponent,
    TranslocoPipe,
    FeedItems,
    ThreadAdd,
    PublicationSkeletonComponent
  ],
  templateUrl: './feed.html',
  styleUrl: './feed.scss'
})
export class Feed {
  private _apiService = inject(ApiService);
  private _settingsService = inject(SettingsService);
  private _webSocketService = inject(WebSocketService);
  private _route = inject(ActivatedRoute);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _destroyRef = inject(DestroyRef);
  private _ngZone = inject(NgZone);
  private _appStore = inject(AppStore);

  loaded = signal(false);
  items = signal<FeedItem[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  allowThreads = this._settingsService.setting('contentAllowThreads', true);
  reactions: { [prop: string]: any };
  skeleton = [1, 2, 3, 4, 5];

  ngOnInit() {
    this._load();
    this._webSocketService
      .listen<FeedItem>('addFeedItem')
      .pipe(takeUntilDestroyed(this._destroyRef))
      .subscribe(item => {
        this._ngZone.run(() => {
          this.onItemAdded(item);
        });
      });
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  onItemAdded(item: FeedItem): void {
    if (item) {
      this.items.update(items => {
        if (items.find(i => i.id === item.id)) {
          return items;
        }

        return [item, ...items];
      });
    }
  }

  onItemDeleted(params: { targetId: string, targetType: string }): void {
    console.log('Feed: onItemDeleted', params);

    this.items.update(items => {
      const filtered = items.filter(item =>
        !(item.targetType === params.targetType && String(item.targetId) === String(params.targetId))
      );
      console.log('Feed: items count before:', items.length, 'after:', filtered.length);
      return filtered;
    });
  }

  private _load(): void {
    this.loaded.set(false);
    this._apiService
      .get('feed', {
        params: {
          page: this.pageNumber,
        }
      })
      .subscribe((res: any) => {
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
        this.items.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
      });
  }
}
