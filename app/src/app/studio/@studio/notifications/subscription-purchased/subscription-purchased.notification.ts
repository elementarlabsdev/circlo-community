import { Component, computed, input } from '@angular/core';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import {
  Notification,
  NotificationMessage,
  NotificationTime
} from '@ngstarter/components/notifications';
import { Icon } from '@ngstarter/components/icon';

@Component({
  selector: 'app-subscription-purchased',
  standalone: true,
  imports: [
    TimeAgoPipe,
    Notification,
    NotificationMessage,
    NotificationTime,
    Icon
  ],
  templateUrl: './subscription-purchased.notification.html',
  styleUrl: './subscription-purchased.notification.scss'
})
export class SubscriptionPurchasedNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();
}
