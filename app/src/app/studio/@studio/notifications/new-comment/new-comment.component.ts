import { Component, computed, input } from '@angular/core';
import { Dicebear } from '@ngstarter/components/avatar';
import { TimeAgoPipe } from '@pipes/time-ago.pipe';
import { RouterLink } from '@angular/router';
import {
  NotificationActor,
  NotificationAvatarDirective,
  Notification, NotificationContent, NotificationMessage, NotificationTime
} from '@ngstarter/components/notifications';

@Component({
  selector: 'app-new-comment',
  imports: [
    Dicebear,
    TimeAgoPipe,
    RouterLink,
    Notification,
    NotificationAvatarDirective,
    NotificationActor,
    NotificationMessage,
    NotificationContent,
    NotificationTime
  ],
  templateUrl: './new-comment.component.html',
  styleUrl: './new-comment.component.scss'
})
export class NewCommentComponent {
  notification = input.required<any>();

  isUnread = input.required<boolean>();
  lastActor = computed<any>(() => this.notification().data.lastActor);
  quotedCommentText = computed(() => this.notification().data.comment.htmlContent);
  count = computed(() => this.notification().data.count);
  othersCount = computed(() => this.count() - 1);
  displayActors = computed(() => (this.notification().data.actors || []).slice(0, 2));
  avatarAltText = computed(() => `${this.lastActor().name}'s avatar`);
  publicationTitle = computed(() => this.notification().data.publication.title);
  publicationSlug = computed(() => this.notification().data.publication.slug);
  actorUsername = computed(() => this.lastActor().username);
}
