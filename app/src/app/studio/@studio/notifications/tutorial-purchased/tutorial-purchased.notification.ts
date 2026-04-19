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
  selector: 'app-tutorial-purchased',
  standalone: true,
  imports: [
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationMessage,
    NotificationTime,
    Icon
  ],
  templateUrl: './tutorial-purchased.notification.html'
})
export class TutorialPurchasedNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  link = computed(() => {
    const data = this.notification().data;
    if (data.entityId) {
      return ['/tutorials', data.entityId];
    }
    return null;
  });
}
