import { Component, computed, input } from '@angular/core';
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
  selector: 'app-new-reaction',
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
  templateUrl: './new-reaction.component.html',
  styleUrl: './new-reaction.component.scss'
})
export class NewReactionComponent {
  notification = input.required<any>();

  isUnread = input.required<boolean>();
  lastActor = computed<any>(() => this.notification().data.lastActor || this.notification().data.actor);
  count = computed(() => this.notification().data.count || 1);
  othersCount = computed(() => this.count() - 1);
  displayActors = computed(() => (this.notification().data.actors || []).slice(0, 2));
  avatarAltText = computed(() => `${this.lastActor().name}'s avatar`);
  publicationTitle = computed(() => this.notification().data.publication.title);
  publicationSlug = computed(() => this.notification().data.publication.slug);
  actorUsername = computed(() => this.lastActor().username);
}
