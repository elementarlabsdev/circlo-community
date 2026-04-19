import { v4 as uuidv4 } from 'uuid';

export interface NotificationCreateProps {
  userId: string; // Кому предназначено уведомление
  type: string; // Тип, например 'NEW_COMMENT' или 'NEW_FOLLOWER'
  data?: any; // JSON с деталями: id комментария, имя подписчика и т.д.
  relatedEntityId?: string;
}

export class Notification {
  public readonly id: string;
  public readonly userId: string;
  public readonly type: string;
  public readonly data?: any;
  public readonly relatedEntityId?: string;
  public readonly createdAt: Date;

  private _isRead: boolean = false;

  private constructor(
    props: { id: string; createdAt: Date } & NotificationCreateProps,
  ) {
    this.id = props.id;
    this.userId = props.userId;
    this.type = props.type;
    this.data = props.data;
    this.relatedEntityId = props.relatedEntityId;
    this.createdAt = props.createdAt;
  }

  public static create(props: NotificationCreateProps): Notification {
    return new Notification({ id: uuidv4(), createdAt: new Date(), ...props });
  }

  // Бизнес-метод, который защищает инвариант
  public markAsRead(): void {
    if (!this._isRead) {
      this._isRead = true;
      // Здесь можно опубликовать событие домена: NotificationMarkedAsReadEvent
    }
  }

  get isRead(): boolean {
    return this._isRead;
  }
}
