export enum NotificationType {
  NEW_COMMENT = 'NEW_COMMENT',
  REPLY_COMMENT = 'REPLY_COMMENT',
  NEW_FOLLOWER = 'NEW_FOLLOWER',
  POST_MENTION = 'POST_MENTION',
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
  NEW_REACTION = 'NEW_REACTION',
  NEW_COMPLAINT = 'NEW_COMPLAINT',
  PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
  SUBSCRIPTION_PURCHASED = 'SUBSCRIPTION_PURCHASED',
  PUBLICATION_PURCHASED = 'PUBLICATION_PURCHASED',
  TUTORIAL_PURCHASED = 'TUTORIAL_PURCHASED',
  CREDITS_PURCHASED = 'CREDITS_PURCHASED',
  THREAD_REPLY = 'THREAD_REPLY',
}

interface ActorPayload {
  id: string;
  name: string;
  avatarUrl?: string;
  username?: string;
}

export interface CreateNotificationPayload {
  userId: string;
  type: NotificationType;
  actor?: ActorPayload;
  entity?: {
    id: string;
    type: string;
    name?: string;
    [key: string]: any;
  };
  parentEntity?: {
    id: string;
    type: string;
    name?: string;
    [key: string]: any;
  };
  additionalData?: Record<string, any>;
}

export interface NotificationData {
  entityType?: string;
  entityId?: string;
  entityName?: string;
  parentEntityType?: string;
  parentEntityId?: string;
  parentEntityName?: string;
  entity?: {
    id: string;
    type: string;
    name?: string;
    [key: string]: any;
  };
  parentEntity?: {
    id: string;
    type: string;
    name?: string;
    [key: string]: any;
  };
  count?: number;
  actors?: ActorPayload[];
  lastActor?: ActorPayload;
  actor?: ActorPayload;
  [key: string]: any;
}
