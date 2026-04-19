import { IsBoolean, IsNotEmpty } from 'class-validator';

export class NotificationSettingsDto {
  @IsBoolean()
  @IsNotEmpty()
  enableWeeklyNewsletterEmails: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enablePeriodicDigestOfTopPostsFromMyTopics: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enableEmailWhenSomeoneRepliesToMeInCommentThread: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enableEmailWhenSomeoneNewFollowsMe: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enableEmailWhenSomeoneMentionsMe: boolean

  @IsBoolean()
  @IsNotEmpty()
  enableEmailWhenIReceiveBadge: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enablePushNotificationWhenSomeoneRepliesToMeInCommentThread: boolean;

  @IsBoolean()
  @IsNotEmpty()
  enablePushNotificationWhenSomeoneMentionsMe: boolean;

  @IsBoolean()
  @IsNotEmpty()
  notificationsWhenSomeoneReactsToMyContent: boolean;

  @IsBoolean()
  @IsNotEmpty()
  muteAllNotifications: boolean;
}
