import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { Notification } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  CreateNotificationPayload,
  NotificationData,
  NotificationType,
} from '@/notifications/domain/model/notification.model';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';

@Injectable()
export class NotificationsManagerService {
  private readonly logger = new Logger(NotificationsManagerService.name);
  private readonly AGGREGATION_WINDOW_MS: number;
  private readonly MAX_ACTORS_TO_STORE_IN_JSON = 3;

  constructor(
    private prisma: PrismaService,
    private notificationsGateway: DefaultGateway,
    private configService: ConfigService,
    private readonly i18n: I18nService,
  ) {
    this.AGGREGATION_WINDOW_MS = this.configService.get<number>(
      'AGGREGATION_WINDOW_MS',
      10 * 60 * 1000,
    );
  }

  async createOrUpdateNotification(
    payload: CreateNotificationPayload,
  ): Promise<Notification> {
    if (payload.actor && payload.userId == payload.actor.id) {
      return;
    }

    const canAggregate = this.canAggregateNotification(payload);
    let existingNotification: Notification | null = null;

    const aggregationKey = this.getAggregationKey(payload);

    if (canAggregate && aggregationKey) {
      const windowStart = new Date(Date.now() - this.AGGREGATION_WINDOW_MS);
      existingNotification = await this.prisma.notification.findFirst({
        where: {
          userId: payload.userId,
          type: payload.type,
          relatedEntityId: aggregationKey,
          isRead: false,
          createdAt: {
            gte: windowStart,
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });
    }

    if (existingNotification) {
      const updatedNotification = await this.aggregateNotification(
        existingNotification,
        payload,
      );
      const unreadCount = await this.getUnreadCount(payload.userId);
      this.notificationsGateway.sendUpdatedNotificationToUser(
        payload.userId,
        {
          ...updatedNotification,
          message: await this.formatMessage(
            updatedNotification.type as NotificationType,
            updatedNotification.data as any,
          ),
        } as any,
        unreadCount,
      );
      return updatedNotification;
    } else {
      const newNotification = await this.buildAndSaveNewNotification(payload);
      const unreadCount = await this.getUnreadCount(payload.userId);
      this.notificationsGateway.sendNewNotificationToUser(
        payload.userId,
        {
          ...newNotification,
          message: await this.formatMessage(
            newNotification.type as NotificationType,
            newNotification.data as any,
          ),
        } as any,
        unreadCount,
      );
      return newNotification;
    }
  }

  private canAggregateNotification(
    payload: CreateNotificationPayload,
  ): boolean {
    switch (payload.type) {
      case NotificationType.NEW_COMMENT:
      case NotificationType.REPLY_COMMENT:
      case NotificationType.THREAD_REPLY:
        return !!payload.entity?.id;
      case NotificationType.NEW_REACTION:
        return !!payload.parentEntity?.id || !!payload.entity?.id;
      case NotificationType.PAYMENT_RECEIVED:
      case NotificationType.SUBSCRIPTION_PURCHASED:
      case NotificationType.PUBLICATION_PURCHASED:
      case NotificationType.TUTORIAL_PURCHASED:
      case NotificationType.CREDITS_PURCHASED:
        return !!payload.additionalData?.paymentId;
      default:
        return false;
    }
  }

  private getAggregationKey(payload: CreateNotificationPayload): string | null {
    switch (payload.type) {
      case NotificationType.NEW_COMMENT:
      case NotificationType.REPLY_COMMENT:
      case NotificationType.THREAD_REPLY:
        return payload.entity?.id;
      case NotificationType.NEW_REACTION:
        return payload.parentEntity?.id || payload.entity?.id;
      case NotificationType.PAYMENT_RECEIVED:
      case NotificationType.SUBSCRIPTION_PURCHASED:
      case NotificationType.PUBLICATION_PURCHASED:
      case NotificationType.TUTORIAL_PURCHASED:
      case NotificationType.CREDITS_PURCHASED:
        return payload.additionalData?.paymentId;
      default:
        return payload.entity?.id;
    }
  }

  private async aggregateNotification(
    existing: Notification,
    payload: CreateNotificationPayload,
  ): Promise<Notification> {
    const currentData = (existing.data || {}) as NotificationData;
    const newCount = (currentData.count || 1) + 1;
    let actorsList = currentData.actors || [];
    if (payload.actor && !actorsList.find((a) => a.id === payload.actor!.id)) {
      actorsList = [payload.actor, ...actorsList];
      if (actorsList.length > this.MAX_ACTORS_TO_STORE_IN_JSON) {
        actorsList = actorsList.slice(0, this.MAX_ACTORS_TO_STORE_IN_JSON);
      }
    }
    const updatedData: NotificationData = {
      ...currentData,
      count: newCount,
      actors: actorsList,
      lastActor: payload.actor,
      entity: payload.entity || currentData.entity,
      parentEntity: payload.parentEntity || currentData.parentEntity,
      ...(payload.additionalData || {}),
      actor: undefined,
    };
    return this.prisma.notification.update({
      where: { id: existing.id },
      data: {
        data: updatedData as any,
        updatedAt: new Date(),
        isRead: false,
      },
    });
  }

  private async buildAndSaveNewNotification(
    payload: CreateNotificationPayload,
  ): Promise<Notification> {
    const relatedEntityId = this.getAggregationKey(payload);

    const initialData: NotificationData = {
      entityType: payload.entity?.type,
      entityId: payload.entity?.id,
      entityName: payload.entity?.name,
      entity: payload.entity,
      parentEntityType: payload.parentEntity?.type,
      parentEntityId: payload.parentEntity?.id,
      parentEntityName: payload.parentEntity?.name,
      parentEntity: payload.parentEntity,
      ...(payload.additionalData || {}),
    };

    if (this.canAggregateNotification(payload) && payload.actor) {
      initialData.count = 1;
      initialData.actors = [payload.actor];
    } else if (payload.actor) {
      initialData.count = 1;
      initialData.actor = payload.actor;
    }

    initialData.lastActor = payload.actor;

    return this.prisma.notification.create({
      data: {
        userId: payload.userId,
        type: payload.type,
        data: initialData as any,
        relatedEntityId: relatedEntityId,
      },
    });
  }

  private async formatMessage(
    type: NotificationType,
    data: NotificationData,
  ): Promise<string> {
    const entityName = data.entityName;
    const parentEntityName = data.parentEntityName;
    const amount = (data as any).amount;
    const currency = (data as any).currency || 'USD';
    const creditsAmount = amount ? Math.round(amount * 10) : 0;

    if (
      data.actors &&
      data.lastActor &&
      typeof data.count === 'number' &&
      data.count > 0
    ) {
      const count = data.count;
      const displayActors = (data.actors || []).slice(0, 2);
      const lastActorName = data.lastActor.name;
      let actorString = '';

      if (count === 1) {
        actorString = `<a href="/user/${data.lastActor.username}" target="_blank">${lastActorName}</a>`;
      } else if (count === 2 && displayActors.length === 2) {
        if (displayActors[0].id === displayActors[1].id)
          actorString = `<a href="/user/${displayActors[0].username}" target="_blank">${displayActors[0].name}</a>`;
        else {
          const actor1 = `<a href="/user/${displayActors[0].username}" target="_blank">${displayActors[0].name}</a>`;
          const actor2 = `<a href="/user/${displayActors[1].username}" target="_blank">${displayActors[1].name}</a>`;
          actorString = `${actor1} and ${actor2}`;
        }
      } else if (displayActors.length > 0) {
        actorString = displayActors
          .map(
            (a) =>
              `<a href="/user/${a.username}" target="_blank">${a.name}</a>`,
          )
          .join(', ');
        const othersCount = count - displayActors.length;

        if (othersCount > 0) {
          if (othersCount === 1) {
            actorString += await this.i18n.t(
              'common.notifications.and_one_other',
            );
          } else {
            actorString += await this.i18n.t(
              'common.notifications.and_others',
              {
                args: { othersCount },
              },
            );
          }
        }
      } else {
        actorString = await this.i18n.t('common.notifications.users_count', {
          args: { count },
        });
      }

      switch (type) {
        case NotificationType.NEW_COMMENT:
          return await this.i18n.t(
            entityName
              ? 'notifications.commented_on_publication'
              : 'notifications.commented_on_item',
            { args: { actors: actorString, entityName } },
          );
        case NotificationType.REPLY_COMMENT:
          return await this.i18n.t(
            parentEntityName
              ? 'notifications.replied_to_comment_on_post'
              : 'notifications.replied_to_comment',
            { args: { actors: actorString, parentEntityName } },
          );
        case NotificationType.THREAD_REPLY:
          return await this.i18n.t('notifications.replied_to_thread', {
            args: { actors: actorString },
          });
        case NotificationType.NEW_REACTION:
          return await this.i18n.t('notifications.reacted_to_your_content', {
            args: { actors: actorString },
          });
      }
    } else if (data.actor) {
      const actorString = `<a href="/user/${data.actor.username}" target="_blank">${data.actor.name}</a>`;
      switch (type) {
        case NotificationType.NEW_COMMENT:
          return await this.i18n.t(
            entityName
              ? 'notifications.commented_on_publication'
              : 'notifications.commented_on_item',
            { args: { actors: actorString, entityName } },
          );
        case NotificationType.REPLY_COMMENT:
          return await this.i18n.t(
            parentEntityName
              ? 'notifications.replied_to_comment_on_post'
              : 'notifications.replied_to_comment',
            { args: { actors: actorString, parentEntityName } },
          );
        case NotificationType.THREAD_REPLY:
          return await this.i18n.t('notifications.replied_to_thread', {
            args: { actors: actorString },
          });
        case NotificationType.NEW_REACTION:
          return await this.i18n.t('notifications.reacted_to_your_content', {
            args: { actors: actorString },
          });
        case NotificationType.POST_MENTION:
          return await this.i18n.t(
            entityName
              ? 'notifications.mentioned_in_post'
              : 'notifications.mentioned_in_a_post',
            { args: { actors: actorString, entityName } },
          );
        case NotificationType.NEW_FOLLOWER:
          return await this.i18n.t('notifications.started_following', {
            args: { actors: actorString },
          });
        case NotificationType.NEW_COMPLAINT:
          return await this.i18n.t('notifications.new_complaint', {
            args: { actors: actorString, entityName },
          });
      }
    }

    switch (type) {
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return (
          (data.messageContent as string) ||
          (await this.i18n.t('common.notifications.new_announcement'))
        );
      case NotificationType.PAYMENT_RECEIVED:
        return await this.i18n.t('common.notifications.payment_received', {
          args: { amount: amount || 0, currency },
        });
      case NotificationType.SUBSCRIPTION_PURCHASED:
        return await this.i18n.t(
          'common.notifications.subscription_purchased',
          {
            args: { amount: amount || 0, currency },
          },
        );
      case NotificationType.PUBLICATION_PURCHASED:
        return await this.i18n.t('common.notifications.publication_purchased', {
          args: { amount: amount || 0, currency, entityName },
        });
      case NotificationType.TUTORIAL_PURCHASED:
        return await this.i18n.t('common.notifications.tutorial_purchased', {
          args: { amount: amount || 0, currency, entityName },
        });
      case NotificationType.CREDITS_PURCHASED:
        return await this.i18n.t('common.notifications.credits_purchased', {
          args: { amount: amount || 0, currency, creditsAmount },
        });
      default:
        let baseMessage = (await this.i18n.t(
          'common.notifications.new_notification',
        )) as string;
        if (entityName)
          baseMessage += await this.i18n.t(
            'common.notifications.regarding_entity',
            { args: { entityName } },
          );
        if (parentEntityName)
          baseMessage += await this.i18n.t(
            'common.notifications.in_parent_entity',
            { args: { parentEntityName } },
          );
        return `${baseMessage}.`;
    }
  }

  async getNotificationsForUser(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean },
  ): Promise<any[]> {
    const notifications = await this.prisma.notification.findMany({
      where: { userId, isRead: options.unreadOnly ? false : undefined },
      orderBy: { updatedAt: 'desc' },
      take: options.limit || 20,
      skip: options.offset || 0,
    });

    return Promise.all(
      notifications.map(async (n) => ({
        ...n,
        message: await this.formatMessage(
          n.type as NotificationType,
          n.data as any,
        ),
      })),
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({ where: { userId, isRead: false } });
  }

  async getNotifications(
    userId: string,
    options: { limit?: number; offset?: number; unreadOnly?: boolean },
  ): Promise<{
    notifications: any[];
    totalNotificationsCount: number;
    unreadNotificationsCount: number;
    pagesCount: number;
  }> {
    const limit = options.limit ?? 20;
    const offset = options.offset ?? 0;
    const where: any = { userId };

    if (options.unreadOnly) {
      where.isRead = false;
    }

    const [totalNotificationsCount, unreadNotificationsCount, notifications] =
      await this.prisma.$transaction([
        this.prisma.notification.count({ where }),
        this.prisma.notification.count({ where: { userId, isRead: false } }),
        this.prisma.notification.findMany({
          where,
          orderBy: { updatedAt: 'desc' },
          take: limit,
          skip: offset,
        }),
      ]);

    const notificationsWithMessages = await Promise.all(
      notifications.map(async (n) => ({
        ...n,
        message: await this.formatMessage(
          n.type as NotificationType,
          n.data as any,
        ),
      })),
    );

    const pagesCount = Math.max(1, Math.ceil(totalNotificationsCount / limit));
    return {
      notifications: notificationsWithMessages,
      totalNotificationsCount,
      unreadNotificationsCount,
      pagesCount,
    };
  }

  async markAsRead(
    notificationId: string,
    userId: string,
  ): Promise<Notification> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification)
      throw new NotFoundException(
        `Notification with ID "${notificationId}" not found.`,
      );
    if (notification.userId !== userId)
      throw new ForbiddenException(
        'You are not allowed to modify this notification.',
      );
    if (notification.isRead) return notification;
    const updated = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.sendUpdatedNotificationToUser(
      userId,
      updated,
      unreadCount,
    );
    return updated;
  }

  async markAllAsRead(userId: string): Promise<{ count: number }> {
    const result = await this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
    this.notificationsGateway.sendAllNotificationsReadEventToUser(userId, 0);
    return { count: result.count };
  }

  async deleteNotification(
    notificationId: string,
    userId: string,
  ): Promise<void> {
    const notification = await this.prisma.notification.findUnique({
      where: { id: notificationId },
    });
    if (!notification) return;
    if (notification.userId !== userId)
      throw new ForbiddenException(
        'You are not allowed to delete this notification.',
      );
    await this.prisma.notification.delete({ where: { id: notificationId } });
    const unreadCount = await this.getUnreadCount(userId);
    this.notificationsGateway.sendDeletedNotificationToUser(
      userId,
      notificationId,
      unreadCount,
    );
  }
}
