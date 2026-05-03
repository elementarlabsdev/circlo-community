import { Component, computed, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import {
  NotificationActor,
  NotificationAvatarDirective,
  Notification,
  NotificationMessage,
  NotificationTime
} from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'app-new-follower',
  standalone: true,
  imports: [
    Dicebear,
    TimeAgoPipe,
    RouterLink,
    NotificationActor,
    NotificationAvatarDirective,
    Notification,
    NotificationMessage,
    NotificationTime
  ],
  templateUrl: './new-follower.notification.html',
  styleUrl: './new-follower.notification.scss'
})
export class NewFollowerNotification {
  notification = input.required<any>();

  isUnread = input.required<boolean>();
  lastActor = computed<any>(() => this.notification().data.lastActor || this.notification().data.actor);
  avatarAltText = computed(() => `${this.lastActor().name}'s avatar`);
  count = computed(() => this.notification().data.count);
  othersCount = computed(() => this.count() - this.displayActors().length);
  displayActors = computed(() => (this.notification().data.actors || []).slice(0, 2));
}
