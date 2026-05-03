import { Component, inject, signal } from '@angular/core';
import { BlocksContent } from '@app/blocks-content/blocks-content';
import { CommentListComponent } from '@app/comment-list/comment-list.component';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { Icon } from '@ngstarter-ui/components/icon';
import { ImageProxyPipe } from '@/pipes/image-proxy.pipe';
import { LayoutSlotComponent } from '@app/layout-slot/layout-slot.component';
import { Button } from '@ngstarter-ui/components/button';
import { SubscriptionComponent } from '@app/subscription/subscription.component';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { TranslocoPipe } from '@jsverse/transloco';
import { Divider } from '@ngstarter-ui/components/divider';
import { ApiService } from '@services/api.service';
import { ActivatedRoute, Router, ROUTER_OUTLET_DATA, RouterLink } from '@angular/router';
import { TutorialInterface } from '@model/interfaces';
import { environment } from '../../../environments/environment';
import { AppStore } from '@store/app.store';
import { SeoService } from '@ngstarter-ui/components/core';
import { ReadingTime } from '@app/reading-time/reading-time';
import { ViewsCount } from '@app/views-count/views-count';

@Component({
  selector: 'app-lesson',
  imports: [
    BlocksContent,
    CommentListComponent,
    Dicebear,
    Icon,
    ImageProxyPipe,
    LayoutSlotComponent,
    Button,
    SubscriptionComponent,
    TimeAgoPipe,
    TranslocoPipe,
    Divider,
    RouterLink,
    ReadingTime,
    ViewsCount
  ],
  templateUrl: './lesson.html',
  styleUrl: './lesson.scss',
})
export class Lesson {
  private api = inject(ApiService);
  private activatedRoute = inject(ActivatedRoute);
  private appStore = inject(AppStore);
  private seoService = inject(SeoService);
  private routeOutletData = inject<any>(ROUTER_OUTLET_DATA);

  loaded = signal(false);
  lesson = signal<any>(null);
  tutorial = signal<TutorialInterface | null>(null);
  isDiscussionEnabled = signal(false);
  previousItem = signal<any>(null);
  nextItem = signal<any>(null);

  get tutorialSlug() {
    return this.routeOutletData().tutorialSlug;
  }

  ngOnInit() {
    const lessonSlug = this.activatedRoute.snapshot.params['lessonSlug'];

    if (lessonSlug) {
      this.loadLesson(lessonSlug);
    } else {
      this.api
        .get(`tutorials/${this.tutorialSlug}/first-item`)
        .subscribe((res: any) => {
          this.tutorial.set(res.tutorial);
          this.lesson.set(res.item.lesson);
          this.isDiscussionEnabled.set(res.tutorial.discussionEnabled);
          this.loaded.set(true);
        });
    }

    this.activatedRoute.params.subscribe(params => {
      this.loadLesson(params['lessonSlug'])
    });
  }

  onCommentAdded() {
    this.lesson().commentsCount += 1;
  }

  private loadLesson(lessonSlug: string) {
    this.api
      .get(`tutorials/${this.tutorialSlug}/lessons/${lessonSlug}`)
      .subscribe((res: any) => {
        this.tutorial.set(res.tutorial);
        this.lesson.set(res.lesson);
        this.isDiscussionEnabled.set(res.tutorial.discussionEnabled);
        this.previousItem.set(res.previousItem);
        this.nextItem.set(res.nextItem);

        this.seoService.updateTitle(
          (this.lesson().metaTitle || this.lesson().name) + ' | ' + (this.tutorial()?.metaTitle || this.tutorial()?.title)
        );
        this.seoService.updateDescription(this.lesson().metaDescription);
        this.seoService.updateOgImage(this.lesson().featuredImageUrl);
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
          content: this.lesson().metaTitle || this.lesson().name
        });
        this.seoService.meta.addTag({
          name: 'twitter:description',
          content: this.lesson().metaDescription
        });

        if (this.lesson()!.featuredImageUrl) {
          this.seoService.meta.addTag({
            name: 'twitter:image',
            content: this.lesson().featuredImageUrl
          });
        }

        this.loaded.set(true);
      });
  }
}
