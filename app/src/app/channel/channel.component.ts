import { Component, inject, OnInit, signal } from '@angular/core';
import { SettingsService } from '@services/settings.service';
import { Channel, FeedItem, Pagination, Publication } from '@model/interfaces';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Divider } from '@ngstarter-ui/components/divider';
import { SeoService } from '@ngstarter-ui/components/core';
import { PaginatorComponent } from '@app/paginator';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { SubscriptionStore } from '@store/subscription.store';
import { FollowersCountComponent } from '@app/followers-count/followers-count.component';
import { PublicationsCountComponent } from '@app/publications-count/publications-count.component';
import {
  BreadcrumbItem,
  Breadcrumbs,
  BreadcrumbSeparator
} from '@ngstarter-ui/components/breadcrumbs';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import {
  Accordion,
  ExpansionPanel,
  ExpansionPanelHeader,
  ExpansionPanelTitle
} from '@ngstarter-ui/components/expansion';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TranslocoPipe } from '@jsverse/transloco';
import { FeedItems } from '@app/feed-items/feed-items';
import { TutorialsCount } from '@app/tutorials-count/tutorials-count';

@Component({
  selector: 'app-channel',
  standalone: true,
  imports: [
    Divider,
    PaginatorComponent,
    SubscriptionComponent,
    FollowersCountComponent,
    PublicationsCountComponent,
    RouterLink,
    BreadcrumbSeparator,
    BreadcrumbItem,
    Breadcrumbs,
    ImageProxyPipe,
    Accordion,
    ExpansionPanelTitle,
    ExpansionPanelHeader,
    ExpansionPanel,
    Dicebear,
    TranslocoPipe,
    FeedItems,
    TutorialsCount
  ],
  templateUrl: './channel.component.html',
  styleUrl: './channel.component.scss'
})
export class ChannelComponent implements OnInit {
  private _apiService = inject(ApiService);
  private _settingsService = inject(SettingsService);
  private _route = inject(ActivatedRoute);
  private _seoService = inject(SeoService);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _appStore = inject(AppStore);

  channel: Channel;
  loaded = signal(false);
  items = signal<FeedItem[]>([]);
  pagination = signal<Pagination>({
    totalItems: 0,
    totalPages: 0,
    pageSize: 0,
    pageNumber: 0
  });
  reactions: { [prop: string]: any };
  pageNumber = this._route.snapshot.params['pageNumber'] || 1;
  allowPublications = this._settingsService.setting('contentAllowPublications', true);
  allowTutorials = this._settingsService.setting('contentAllowTutorials', true);

  get route(): string {
    return `/channel/${this.channel.slug}/page`;
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
      .get(`channel/${this._route.snapshot.params['slug']}`, {
        params: {
          pageNumber: this.pageNumber
        }
      })
      .subscribe((res: any) => {
        this.channel = res.channel;
        this._subscriptionStore.set(res.subscriptions);
        this._bookmarkStore.set(res.bookmarks);
        this.reactions = res.reactions;
        if (res.reactions) {
          this._appStore.setReactions(res.reactions);
        }
        this.items.set(res.items);
        this.pagination.set(res.pagination);
        this.loaded.set(true);
        this._seoService.updateTitle(this.channel.metaTitle || this.channel.name);
        this._seoService.updateDescription(this.channel.metaDescription || this.channel.description);
      })
    ;
  }
}
