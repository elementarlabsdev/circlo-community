import { Component, computed, input } from '@angular/core';
import { Dicebear } from '@ngstarter-ui/components/avatar';
import {
  NotificationActor,
  NotificationAvatarDirective,
  Notification, NotificationContent, NotificationMessage, NotificationTime
} from '@ngstarter-ui/components/notifications';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-reply-comment',
  standalone: true,
  imports: [
    Dicebear,
    NotificationActor,
    NotificationAvatarDirective,
    Notification,
    NotificationContent,
    NotificationMessage,
    NotificationTime,
    TimeAgoPipe,
    RouterLink
  ],
  templateUrl: './reply-comment.notification.html',
  styleUrl: './reply-comment.notification.scss'
})
export class ReplyCommentNotification {
  notification = input.required<any>();

  isUnread = input.required<boolean>();
  lastActor = computed<any>(() => this.notification().data.lastActor);
  quotedCommentText = computed(() => this.notification().data.comment.htmlContent);
  count = computed(() => this.notification().data.count);
  othersCount = computed(() => this.count() - 1);
  displayActors = computed(() => (this.notification().data.actors || []).slice(0, 2));
  avatarAltText = computed(() => `${this.lastActor().name}'s avatar`);
  actorDisplayName = computed(() => this.lastActor().name);
  actorUsername = computed(() => this.lastActor().username);
  publicationTitle = computed(() => this.notification().data.publication.title);
  publicationSlug = computed(() => this.notification().data.publication.slug);
}
