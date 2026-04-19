import { Component, inject, OnInit, signal } from '@angular/core';
import { ApiService } from '@services/api.service';
import {
  NotificationDefDirective,
  NotificationList,
} from '@ngstarter/components/notifications';
import {
  EmptyState,
  EmptyStateContent, EmptyStateIcon
} from '@ngstarter/components/empty-state';
import { Icon } from '@ngstarter/components/icon';
import { AppStore } from '@store/app.store';
import { TranslocoPipe } from '@jsverse/transloco';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbsStore } from '@ngstarter/components/breadcrumbs';
import { NewCommentComponent } from '@/studio/@studio/notifications/new-comment/new-comment.component';
import { NewFollowerNotification } from '@/studio/@studio/notifications/new-follower/new-follower.notification';
import { ReplyCommentNotification } from '@/studio/@studio/notifications/reply-comment/reply-comment.notification';
import { NewReactionComponent } from '@/studio/@studio/notifications/new-reaction/new-reaction.component';
import { NewComplaintNotification } from '@/studio/@studio/notifications/new-complaint/new-complaint.component';
import { PaymentReceivedNotification } from '@/studio/@studio/notifications/payment-received/payment-received.notification';
import { SubscriptionPurchasedNotification } from '@/studio/@studio/notifications/subscription-purchased/subscription-purchased.notification';
import { PublicationPurchasedNotification } from '@/studio/@studio/notifications/publication-purchased/publication-purchased.notification';
import { TutorialPurchasedNotification } from '@/studio/@studio/notifications/tutorial-purchased/tutorial-purchased.notification';
import { CreditsPurchasedNotification } from '@/studio/@studio/notifications/credits-purchased/credits-purchased.notification';
import { ThreadReplyNotification } from '@/studio/@studio/notifications/thread-reply/thread-reply.notification';
import { DecimalPipe } from '@angular/common';

@Component({
  standalone: true,
  imports: [
    NotificationDefDirective,
    NotificationList,
    EmptyState,
    EmptyStateContent,
    EmptyStateIcon,
    Icon,
    TranslocoPipe,
    NewCommentComponent,
    NewFollowerNotification,
    ReplyCommentNotification,
    NewReactionComponent,
    NewComplaintNotification,
    PaymentReceivedNotification,
    SubscriptionPurchasedNotification,
    PublicationPurchasedNotification,
    TutorialPurchasedNotification,
    CreditsPurchasedNotification,
    ThreadReplyNotification,
    DecimalPipe
  ],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class NotificationsComponent implements OnInit {
  private _route = inject(ActivatedRoute);
  private _api = inject(ApiService);
  private _appStore = inject(AppStore);
  private _breadcrumbsStore = inject(BreadcrumbsStore);

  constructor() {
    this._appStore.setTitle(this._route.snapshot.title || '');
    this._breadcrumbsStore.setBreadcrumbs([
      {
        id: 'home',
        route: '/',
        type: 'link',
        iconName: 'fluent:home-24-regular'
      },
      {
        id: 'studio',
        name: 'breadcrumbs.studio',
        route: '/studio',
        type: 'link',
      },
      {
        name: 'breadcrumbs.notifications',
        id: 'notifications',
        type: null
      }
    ]);
  }

  loading = signal(true);
  notifications = signal<any[]>([]);
  totalNotificationsCount = signal(0);
  unreadNotificationsCount = signal(0);
  pagesCount = signal(1);
  pageSize = signal(20);
  offset = signal(0);
  loadingMore = signal(false);

  ngOnInit() {
    this.loadInitial();
  }

  private loadInitial() {
    this.loading.set(true);
    this._api
      .get(`studio/notifications?limit=${this.pageSize()}&offset=0`)
      .subscribe((res: any) => {
        this.notifications.set(res.notifications || []);
        this.totalNotificationsCount.set(res.totalNotificationsCount ?? (res.notifications?.length || 0));
        this.unreadNotificationsCount.set(res.unreadNotificationsCount ?? 0);
        this.pagesCount.set(res.pagesCount ?? 1);
        this.offset.set(this.notifications().length);
        this.loading.set(false);
      });
  }

  loadMore() {
    if (this.loadingMore()) return;
    if (this.notifications().length >= this.totalNotificationsCount()) return;
    this.loadingMore.set(true);
    const nextOffset = this.offset();
    this._api
      .get(`studio/notifications?limit=${this.pageSize()}&offset=${nextOffset}`)
      .subscribe((res: any) => {
        const next = res.notifications || [];
        this.notifications.set([...(this.notifications() || []), ...next]);
        this.totalNotificationsCount.set(res.totalNotificationsCount ?? this.totalNotificationsCount());
        this.unreadNotificationsCount.set(res.unreadNotificationsCount ?? this.unreadNotificationsCount());
        this.pagesCount.set(res.pagesCount ?? this.pagesCount());
        this.offset.set(this.notifications().length);
        this.loadingMore.set(false);
      });
  }

  markAsRead(notification: any) {
    if (notification.isRead) {
      return;
    }

    notification.isRead = true;
    this._appStore.setUnreadNotificationsCount(this._appStore.unreadNotificationsCount() - 1);
    this._api.patch(`studio/notifications/${notification.id}/read`, {}).subscribe(() => {});
  }
}
