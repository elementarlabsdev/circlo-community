/**
 * Интерфейс для всех возможных настроек уведомлений.
 * Все поля опциональны для удобства при создании и обновлении.
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
  // --- Свойства с четкими именами ---
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
   * Статический фабричный метод, который устанавливает разумные
   * значения по умолчанию для нового пользователя.
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
   * Обновляет настройки, возвращая новый экземпляр.
   * @param updatedProps Объект с настройками, которые нужно изменить.
   */
  public update(updatedProps: UserNotificationSettingsProps): UserNotificationSettings {
    const currentProps = this.toProps();
    const newProps = { ...currentProps, ...updatedProps };
    return UserNotificationSettings.create(newProps);
  }

  /**
   * Возвращает новый экземпляр с выключенными уведомлениями.
   */
  public muteAllNotifications(): UserNotificationSettings {
    return this.update({ muteAllNotifications: true });
  }

  /**
   * Возвращает новый экземпляр с включенными уведомлениями.
   */
  public unmuteAllNotifications(): UserNotificationSettings {
    return this.update({ muteAllNotifications: false });
  }

  /**
   * Вспомогательный метод для преобразования текущего состояния в Props-объект.
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
   * Сравнивает два объекта настроек.
   */
  public equals(other: UserNotificationSettings): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return JSON.stringify(this.toProps()) === JSON.stringify(other.toProps());
  }
}
