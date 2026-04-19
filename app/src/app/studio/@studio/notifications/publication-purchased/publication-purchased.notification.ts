import { Component, computed, input } from '@angular/core';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import {
  Notification,
  NotificationMessage,
  NotificationTime
} from '@ngstarter/components/notifications';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-publication-purchased',
  standalone: true,
  imports: [
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationMessage,
    NotificationTime,
    Icon
  ],
  templateUrl: './publication-purchased.notification.html',
  styleUrl: './publication-purchased.notification.scss'
})
export class PublicationPurchasedNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  link = computed(() => {
    const data = this.notification().data;
    if (data.entityId) {
      return ['/publications', data.entityId];
    }
    return null;
  });
}
