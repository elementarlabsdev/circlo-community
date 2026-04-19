import { ChangeDetectionStrategy, Component, inject, OnInit, computed, signal } from '@angular/core';
import { ListItem, NavList } from '@ngstarter/components/list';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Icon } from '@ngstarter/components/icon';
import { ApiService } from '@services/api.service';
import { PopoverTriggerForDirective } from '@ngstarter/components/popover';
import { TranslocoPipe } from '@jsverse/transloco';
import { BookmarkButtonComponent } from '@app/bookmark-button/bookmark-button.component';
import { ReactionAddComponent } from '@app/reaction-add/reaction-add.component';
import { ReactionListComponent } from '@app/reaction-list/reaction-list.component';
import { ReactionItem } from '@model/interfaces';
import { environment } from '../../../environments/environment';
import { SeoService } from '@ngstarter/components/core';
import { SubscriptionStore } from '@store/subscription.store';
import { BookmarkStore } from '@store/bookmark.store';
import { AppStore } from '@store/app.store';
import { Toolbar } from '@ngstarter/components/toolbar';

@Component({
  imports: [
    Icon,
    ListItem,
    NavList,
    RouterOutlet,
    RouterLinkActive,
    RouterLink,
    TranslocoPipe,
    BookmarkButtonComponent,
    ReactionAddComponent,
    PopoverTriggerForDirective,
    ReactionListComponent
  ],
  templateUrl: './common.html',
  styleUrl: './common.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Common implements OnInit {
  private api = inject(ApiService);
  private activatedRoute = inject(ActivatedRoute);
  private appStore = inject(AppStore);
  private seoService = inject(SeoService);
  private subscriptionStore = inject(SubscriptionStore);
  private bookmarkStore = inject(BookmarkStore);

  loaded = signal(false);
  tutorial = signal<any>(null);

  reactions: ReactionItem[] = [];

  get tutorialSlug() {
    return this.activatedRoute.snapshot.params['tutorialSlug'];
  }

  hasReactions = computed(() => this.reactions.filter(item => item.hasReaction).length > 0);

  ngOnInit() {
    this.api
      .get(`tutorials/slug/${this.tutorialSlug}`)
      .subscribe((res: any)=> {
        this.tutorial.set(res.tutorial);
        this.loaded.set(true);
        this.reactions = res.reactions;
        this.appStore.setReactions(res.reactions);

        if (res.channelSubscription) {
          this.subscriptionStore.set([res.channelSubscription]);
        }

        if (res.authorSubscription) {
          this.subscriptionStore.set([res.authorSubscription]);
        }

        if (res.bookmark) {
          this.bookmarkStore.set([res.bookmark]);
        }

        this.seoService.updateTitle(this.tutorial().metaTitle || this.tutorial().title);
        this.seoService.updateDescription(this.tutorial().metaDescription);
        this.seoService.updateOgImage(this.tutorial().featuredImageUrl);
        this.seoService.meta.updateTag({
          name: 'og:locale',
          content: environment.locale
        });
        this.seoService.meta.addTag({
          name: 'twitter:card',
          content: 'summary_large_image'
        });
        this.seoService.meta.addTag({
          name: 'twitter:domain',
          content: `${this.appStore.hostUrl()}/tutorial/${this.tutorialSlug}`
        });
        this.seoService.meta.addTag({
          name: 'twitter:title',
          content: this.tutorial().metaTitle || this.tutorial().title
        });
        this.seoService.meta.addTag({
          name: 'twitter:description',
          content: this.tutorial().metaDescription
        });

        if (this.tutorial().featuredImageUrl) {
          this.seoService.meta.addTag({
            name: 'twitter:image',
            content: this.tutorial().featuredImageUrl
          });
        }
      });
  }

  onReactionAdded(): void {
    this.tutorial().reactionsCount += 1;
  }

  onReactionDeleted(): void {
    this.tutorial().reactionsCount -= 1;
  }
}
