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
  selector: 'app-credits-purchased',
  standalone: true,
  imports: [
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationMessage,
    NotificationTime,
    Icon
  ],
  templateUrl: './credits-purchased.notification.html',
  styleUrl: './credits-purchased.notification.scss'
})
export class CreditsPurchasedNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  link = computed(() => ['/studio/credits']);
}
