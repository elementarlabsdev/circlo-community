import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Publication, ReactionItem } from '@model/interfaces';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReactionAddComponent } from '@app/reaction-add/reaction-add.component';
import { Icon } from '@ngstarter/components/icon';
import { SeoService } from '@ngstarter/components/core';
import { Divider } from '@ngstarter/components/divider';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { Dicebear } from '@ngstarter/components/avatar';
import { SubscriptionStore } from '@store/subscription.store';
import { CommentListComponent } from '@app/comment-list/comment-list.component';
import { BookmarkStore } from '@store/bookmark.store';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { AppStore } from '@store/app.store';
import { ReactionListComponent } from '@app/reaction-list/reaction-list.component';
import { PopoverTriggerForDirective } from '@ngstarter/components/popover';
import { Alert } from '@ngstarter/components/alert';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { environment } from '../../environments/environment';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { LayoutSlotComponent } from '@app/layout-slot/layout-slot.component';
import findRecursive from '@/_utils/find-recursive';
import { BlocksContent } from '@app/blocks-content/blocks-content';
import { ViewsCount } from '@app/views-count/views-count';
import { ReadingTime } from '@app/reading-time/reading-time';
import { Button } from '@ngstarter/components/button';
import { AddComplaintDirective } from '@/@directives/add-complaint.directive';
import { Menu, MenuItem, MenuTrigger } from '@ngstarter/components/menu';
import { SnackBar } from '@ngstarter/components/snack-bar';

@Component({
  standalone: true,
  imports: [
    Icon,
    TimeAgoPipe,
    RouterLink,
    ReactionAddComponent,
    Divider,
    Dicebear,
    CommentListComponent,
    BookmarkButtonComponent,
    ReactionListComponent,
    PopoverTriggerForDirective,
    Alert,
    ImageProxyPipe,
    TranslocoPipe,
    SubscriptionComponent,
    LayoutSlotComponent,
    BlocksContent,
    ViewsCount,
    ReadingTime,
    Button,
    AddComplaintDirective,
    Menu,
    MenuItem,
    MenuTrigger,
    Button
  ],
  templateUrl: './view.component.html',
  styleUrl: './view.component.scss'
})
export class ViewComponent implements OnInit {
  private _appStore = inject(AppStore);
  private _apiService = inject(ApiService);
  private _route = inject(ActivatedRoute);
  private _seoService = inject(SeoService);
  private _subscriptionStore = inject(SubscriptionStore);
  private _bookmarkStore = inject(BookmarkStore);
  private _snackBar = inject(SnackBar);

  loading = signal(true);
  readNext = signal<Publication[]>([]);
  licenseTypes = signal<any[]>([]);
  donationLinks = signal<any[]>([]);
  isPurchased = signal(false);
  hasAccess = signal(true);

  publication: Publication;
  reactions: ReactionItem[] = [];
  morePublicationsOfChannel: Publication[] = [];

  get isCommentsEnabled(): boolean {
    if (!this.publication.discussionEnabled) {
      return false;
    }

    return this._appStore.isCommentsEnabled();
  }

  get hasReactions(): boolean {
    return this.reactions.filter(item => item.hasReaction).length > 0;
  }

  ngOnInit() {
    this._apiService
      .get(`p/${this._route.snapshot.params['slug']}`)
      .subscribe((res: any) => {
        this.publication = res.publication;
        this.reactions = res.reactions;
        this._appStore.setReactions(res.reactions);
        this.readNext.set(res.readNext);
        this.licenseTypes.set(res.licenseTypes);
        this.donationLinks.set(res.donationLinks);
        this.morePublicationsOfChannel = res.morePublicationsOfChannel;

        if (res.channelSubscription) {
          this._subscriptionStore.set([res.channelSubscription]);
        }

        if (res.authorSubscription) {
          this._subscriptionStore.set([res.authorSubscription]);
        }

        if (res.bookmark) {
          this._bookmarkStore.set([res.bookmark]);
        }

        this._seoService.updateTitle(this.publication.metaTitle || this.publication.title);
        this._seoService.updateDescription(this.publication.metaDescription);
        this._seoService.updateOgImage(this.publication.featuredImageUrl);
        this._seoService.meta.updateTag({
          name: 'og:locale',
          content: environment.locale
        });
        this._seoService.meta.addTag({
          name: 'twitter:card',
          content: 'summary_large_image'
        });
        this._seoService.meta.addTag({
          name: 'twitter:domain',
          content: `${this._appStore.hostUrl()}/publication/${this._route.snapshot.params['slug']}`
        });
        this._seoService.meta.addTag({
          name: 'twitter:title',
          content: this.publication.metaTitle || this.publication.title
        });
        this._seoService.meta.addTag({
          name: 'twitter:description',
          content: this.publication.metaDescription
        });

        if (this.publication.featuredImageUrl) {
          this._seoService.meta.addTag({
            name: 'twitter:image',
            content: this.publication.featuredImageUrl
          });
        }

        this.isPurchased.set(res.isPurchased);
        this.hasAccess.set(res.hasAccess ?? true);
        this.loading.set(false);
      })
    ;
  }

  buy() {
    this._apiService.post(`payments/checkout/publication/${this.publication.id}`).subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this._snackBar.open('Error starting checkout', 'Close', { duration: 3000 });
      }
    });
  }

  buyChannel() {
    if (!this.publication?.channel?.id) {
      return;
    }

    this._apiService.post(`payments/checkout/channel/${this.publication.channel.id}`).subscribe({
      next: (res: any) => {
        if (res.url) {
          window.location.href = res.url;
        }
      },
      error: (err: any) => {
        this._snackBar.open('Error starting checkout', 'Close', { duration: 3000 });
      }
    });
  }

  get licenseRules(): any[] {
    const licenseTypeId = this.publication.licenseTypeId;
    const licenseType = findRecursive<any>(
      this.licenseTypes(), (_: any) => _.id === licenseTypeId
    );

    if (licenseType) {
      let rules = licenseType.rules || [];
      const parent = findRecursive<any>(
        this.licenseTypes(), (_: any) => _.id === licenseType.parentId
      );

      if (parent) {
        rules = [...parent.rules, ...rules];
      }

      return rules;
    }

    return [];
  }

  onReactionAdded(): void {
    this.publication.reactionsCount += 1;
  }

  onReactionDeleted(): void {
    this.publication.reactionsCount -= 1;
  }

  onCommentAdded(): void {
    this.publication.commentsCount += 1;
  }
}
