import { Component, inject, OnInit, signal } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { FollowersCountComponent } from '@app/followers-count/followers-count.component';
import { PaginatorComponent } from '@app/paginator';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SeoService } from '@ngstarter-ui/components/core';
import { SubscriptionStore } from '@store/subscription.store';
import { FeedItem, Pagination, Publication, Topic } from '@model/interfaces';
import { Divider } from '@ngstarter-ui/components/divider';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter-ui/components/breadcrumbs';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { Skeleton } from '@ngstarter-ui/components/skeleton';
import { PublicationSkeletonComponent } from '@app/publication-skeleton/publication-skeleton.component';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { FeedItems } from '@app/feed-items/feed-items';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';

@Component({
  standalone: true,
  imports: [
    Dicebear,
    FollowersCountComponent,
    PaginatorComponent,
    SubscriptionComponent,
    Divider,
    PublicationsCountComponent,
    RouterLink,
    BreadcrumbSeparator,
    BreadcrumbItem,
    Breadcrumbs,
    ImageProxyPipe,
    TranslocoPipe,
    Skeleton,
    FeedItems,
    TutorialsCount
  ],
  templateUrl: './topic.component.html',
  styleUrl: './topic.component.scss'
})
export class TopicComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _settingsService = inject(SettingsService);
  private _route = inject(ActivatedRoute);
  private _seoService = inject(SeoService);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  topic: Topic;
  reactions: { [prop: string]: any };
  loaded = signal(false);
  items = signal<FeedItem[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  allowPublications = this._settingsService.setting('contentAllowPublications', true);
  allowTutorials = this._settingsService.setting('contentAllowTutorials', true);
  skeleton = [1, 2, 3, 4, 5];

  get route(): string {
    return `/topic/${this.topic.slug}/page`;
  }

  ngOnInit() {
    this._load();
  }

  onPageChanged(pageNumber: number): void {
    this.pageNumber = pageNumber;
    this._load();
  }

  private _load(): void {
    this._apiService
      .get(`topic/${this._route.snapshot.params['slug']}`, {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this.topic = res.topic;
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.items.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
        this._seoService.updateTitle(this.topic.metaTitle || this.topic.name);
        this._seoService.updateDescription(this.topic.metaDescription || this.topic.description);
      })
    ;
  }
}
