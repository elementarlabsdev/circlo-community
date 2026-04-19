import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersService } from '@/identity/application/services/users.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class FollowUserUseCase {
  constructor(
    private readonly usersService: UsersService,
    private readonly subscriptionsService: SubscriptionsService,
    private readonly notificationManagerService: NotificationsManagerService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  async execute(actor: User, targetUserId: string): Promise<void> {
    const targetUser = await this.usersService.findOneById(targetUserId);

    const isExist = await this.subscriptionsService.exists(actor, targetUser);
    if (!isExist) {
      await this.subscriptionsService.add(actor, targetUser);

      await this.recommendationQueue.add('update-user-interests', {
        userId: actor.id,
        targetId: targetUserId,
        targetType: 'user',
      });

      await this.notificationManagerService.createOrUpdateNotification({
        userId: targetUser.id,
        type: NotificationType.NEW_FOLLOWER,
        actor: {
          id: actor.id,
          name: actor.name,
          username: actor.username,
          avatarUrl: actor.avatarUrl,
        },
        entity: {
          id: targetUser.id,
          type: 'follower',
        },
        additionalData: {},
      });
    }
  }
}
