import { Component, computed, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import {
  NotificationActor,
  NotificationAvatarDirective,
  Notification, NotificationMessage, NotificationTime
} from '@ngstarter-ui/components/notifications';

@Component({
  selector: 'app-new-complaint',
  standalone: true,
  imports: [
    Dicebear,
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationAvatarDirective,
    NotificationActor,
    NotificationMessage,
    NotificationTime
  ],
  templateUrl: './new-complaint.component.html',
  styleUrl: './new-complaint.component.scss'
})
export class NewComplaintNotification {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  lastActor = computed<any>(() => this.notification().data.lastActor);
  count = computed(() => this.notification().data.count);
  othersCount = computed(() => this.count() - 1);
  displayActors = computed(() => (this.notification().data.actors || []).slice(0, 2));
  avatarAltText = computed(() => `${this.lastActor()?.name || 'Unknown'}'s avatar`);
  entityName = computed(() => this.notification().data.entity.name);
  entityId = computed(() => this.notification().data.entity.id);
  actorUsername = computed(() => this.lastActor()?.username);
}
