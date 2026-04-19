import { Component, inject, signal } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter/components/breadcrumbs';
import { Dicebear } from '@ngstarter/components/avatar';
import { FollowersCountComponent } from '@app/followers-count/followers-count.component';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { PaginatorComponent } from '@app/paginator';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { Divider } from '@ngstarter/components/divider';
import { ApiService } from '@services/api.service';
import { SeoService } from '@ngstarter/components/core';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { FeedItem, Pagination, Publication, User } from '@model/interfaces';
import { PublicationSkeletonComponent } from '@app/publication-skeleton/publication-skeleton.component';
import { Skeleton } from '@ngstarter/components/skeleton';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';
import { FeedItems } from '@app/feed-items/feed-items';
import { ThreadAdd } from '@app/thread-add/thread-add';
import { UserFollowersCount } from '@app/user-followers-count/user-followers-count';

@Component({
  imports: [
    BreadcrumbItem,
    BreadcrumbSeparator,
    Breadcrumbs,
    Dicebear,
    ImageProxyPipe,
    PaginatorComponent,
    PublicationsCountComponent,
    RouterLink,
    SubscriptionComponent,
    TranslocoPipe,
    Divider,
    PublicationSkeletonComponent,
    Skeleton,
    Skeleton,
    TutorialsCount,
    FeedItems,
    ThreadAdd,
    UserFollowersCount
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent {
  private _apiService = inject(ApiService);
  private _settingsService = inject(SettingsService);
  private _route = inject(ActivatedRoute);
  private _seoService = inject(SeoService);
  private _translocoService = inject(TranslocoService);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  user: User;
  publications: Publication[] = [];
  reactions: { [prop: string]: any };
  skeleton = [1, 2, 3, 4, 5];

  loaded = signal(false);
  items = signal<FeedItem[]>([]);
  donationLinks = signal<any[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  allowThreads = this._settingsService.setting('contentAllowThreads', true);
  allowPublications = this._settingsService.setting('contentAllowPublications', true);
  allowTutorials = this._settingsService.setting('contentAllowTutorials', true);

  get route(): string {
    return `/user/${this.user.username}/page`;
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
      .get(`user/${this._route.snapshot.params['username']}`, {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this.user = res.user;
        this._seoService.updateTitle(this._translocoService.translate('user.pageTitle') + this.user.name);
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
        this.items.set(res.items);
        this.donationLinks.set(res.donationLinks);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
      });
  }
}
