import { Component, computed, input, OnInit } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import {
  NotificationActor,
  NotificationAvatarDirective,
  Notification,
  NotificationMessage,
  NotificationTime
} from '@ngstarter/components/notifications';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-thread-reply',
  standalone: true,
  imports: [
    Dicebear,
    NotificationActor,
    NotificationAvatarDirective,
    Notification,
    NotificationMessage,
    NotificationTime,
    TimeAgoPipe,
    RouterLink
  ],
  templateUrl: './thread-reply.notification.html',
  styleUrl: './thread-reply.notification.scss'
})
export class ThreadReplyNotification implements OnInit {
  notification = input.required<any>();
  isUnread = input.required<boolean>();

  lastActor = computed<any>(() => this.notification().data.lastActor || this.notification().data.actor);
  count = computed(() => this.notification().data.count || 1);
  othersCount = computed(() => this.count() - 1);
  displayActors = computed(() => (
    this.notification().data.actors ||
    (this.notification().data.actor ? [this.notification().data.actor] : [])).slice(0, 2)
  );

  avatarAltText = computed(() => `${this.lastActor()?.name || ''}'`);
  actorDisplayName = computed(() => this.lastActor()?.name);
  actorUsername = computed(() => this.lastActor()?.username);
  threadId = computed(() => this.notification().data.entityId);
  entity = computed(() => this.notification().data.entity);

  ngOnInit(): void {
  }
}
