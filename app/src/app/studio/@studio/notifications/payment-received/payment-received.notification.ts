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
  selector: 'app-payment-received',
  standalone: true,
  imports: [
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationMessage,
    NotificationTime,
    Icon
  ],
  templateUrl: './payment-received.notification.html',
  styleUrl: './payment-received.notification.scss'
})
export class PaymentReceivedNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  amount = computed(() => this.notification().data.amount);
  currency = computed(() => this.notification().data.currency || 'USD');
  kind = computed(() => this.notification().data.kind);

  link = computed(() => {
    const data = this.notification().data;
    if (data.kind === 'publication_purchase' && data.entityId) {
      return ['/publications', data.entityId];
    }
    if (data.kind === 'tutorial_purchase' && data.entityId) {
      return ['/tutorials', data.entityId];
    }
    if (data.kind === 'credits_purchase') {
      return ['/studio/credits'];
    }
    return null;
  });
}
