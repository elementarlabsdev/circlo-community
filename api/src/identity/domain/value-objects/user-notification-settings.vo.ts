/**
 * Interface for all possible notification settings.
 * All fields are optional for convenience when creating and updating.
 */
export interface UserNotificationSettingsProps {
  enableWeeklyNewsletterEmails?: boolean;
  enablePeriodicDigestOfTopPostsFromMyTopics?: boolean;
  enableEmailWhenSomeoneRepliesToMeInCommentThread?: boolean;
  enableEmailWhenSomeoneNewFollowsMe?: boolean;
  enableEmailWhenSomeoneMentionsMe?: boolean;
  enableEmailWhenIReceiveBadge?: boolean;
  enablePushNotificationWhenSomeoneRepliesToMeInCommentThread?: boolean;
  enablePushNotificationWhenSomeoneMentionsMe?: boolean;
  notificationsWhenSomeoneReactsToMyContent?: boolean;
  muteAllNotifications?: boolean;
}

export class UserNotificationSettings {
  // --- Properties with clear names ---
  public readonly weeklyNewsletter: boolean;
  public readonly topicDigest: boolean;
  public readonly emailOnReply: boolean;
  public readonly emailOnNewFollower: boolean;
  public readonly emailOnMention: boolean;
  public readonly emailOnBadge: boolean;
  public readonly pushOnReply: boolean;
  public readonly pushOnMention: boolean;
  public readonly onReaction: boolean;
  public readonly muteAll: boolean;

  private constructor(props: { [K in keyof UserNotificationSettingsProps]-?: boolean }) {
    this.weeklyNewsletter = props.enableWeeklyNewsletterEmails;
    this.topicDigest = props.enablePeriodicDigestOfTopPostsFromMyTopics;
    this.emailOnReply = props.enableEmailWhenSomeoneRepliesToMeInCommentThread;
    this.emailOnNewFollower = props.enableEmailWhenSomeoneNewFollowsMe;
    this.emailOnMention = props.enableEmailWhenSomeoneMentionsMe;
    this.emailOnBadge = props.enableEmailWhenIReceiveBadge;
    this.pushOnReply = props.enablePushNotificationWhenSomeoneRepliesToMeInCommentThread;
    this.pushOnMention = props.enablePushNotificationWhenSomeoneMentionsMe;
    this.onReaction = props.notificationsWhenSomeoneReactsToMyContent;
    this.muteAll = props.muteAllNotifications;
    Object.freeze(this);
  }

  /**
   * Static factory method that sets sensible
   * default values for a new user.
   */
  public static create(
    initialProps?: UserNotificationSettingsProps,
  ): UserNotificationSettings {
    const defaults = {
      enableWeeklyNewsletterEmails: false,
      enablePeriodicDigestOfTopPostsFromMyTopics: false,
      enableEmailWhenSomeoneRepliesToMeInCommentThread: true,
      enableEmailWhenSomeoneNewFollowsMe: true,
      enableEmailWhenSomeoneMentionsMe: true,
      enableEmailWhenIReceiveBadge: true,
      enablePushNotificationWhenSomeoneRepliesToMeInCommentThread: true,
      enablePushNotificationWhenSomeoneMentionsMe: true,
      notificationsWhenSomeoneReactsToMyContent: true,
      muteAllNotifications: false,
    };

    const props = { ...defaults, ...initialProps };
    return new UserNotificationSettings(props);
  }

  /**
   * Updates the settings, returning a new instance.
   * @param updatedProps Object with settings to be changed.
   */
  public update(updatedProps: UserNotificationSettingsProps): UserNotificationSettings {
    const currentProps = this.toProps();
    const newProps = { ...currentProps, ...updatedProps };
    return UserNotificationSettings.create(newProps);
  }

  /**
   * Returns a new instance with all notifications muted.
   */
  public muteAllNotifications(): UserNotificationSettings {
    return this.update({ muteAllNotifications: true });
  }

  /**
   * Returns a new instance with notifications unmuted.
   */
  public unmuteAllNotifications(): UserNotificationSettings {
    return this.update({ muteAllNotifications: false });
  }

  /**
   * Helper method to convert the current state to a Props object.
   */
  private toProps(): UserNotificationSettingsProps {
    return {
      enableWeeklyNewsletterEmails: this.weeklyNewsletter,
      enablePeriodicDigestOfTopPostsFromMyTopics: this.topicDigest,
      enableEmailWhenSomeoneRepliesToMeInCommentThread: this.emailOnReply,
      enableEmailWhenSomeoneNewFollowsMe: this.emailOnNewFollower,
      enableEmailWhenSomeoneMentionsMe: this.emailOnMention,
      enableEmailWhenIReceiveBadge: this.emailOnBadge,
      enablePushNotificationWhenSomeoneRepliesToMeInCommentThread: this.pushOnReply,
      enablePushNotificationWhenSomeoneMentionsMe: this.pushOnMention,
      notificationsWhenSomeoneReactsToMyContent: this.onReaction,
      muteAllNotifications: this.muteAll,
    };
  }

  /**
   * Compares two settings objects.
   */
  public equals(other: UserNotificationSettings): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.toProps()) === JSON.stringify(other.toProps());
  }
}
