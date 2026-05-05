import { v4 as uuidv4 } from 'uuid';

export interface NotificationCreateProps {
  userId: string; // Who the notification is for
  type: string; // Type, e.g., 'NEW_COMMENT' or 'NEW_FOLLOWER'
  data?: any; // JSON with details: comment id, follower name, etc.
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

  // Business method that protects the invariant
  public markAsRead(): void {
    if (!this._isRead) {
      this._isRead = true;
      // A domain event can be published here: NotificationMarkedAsReadEvent
    }
  }

  get isRead(): boolean {
    return this._isRead;
  }
}
