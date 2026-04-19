import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class FollowChannelUseCase {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly subscriptionsService: SubscriptionsService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  async execute(user: User, channelId: string): Promise<void> {
    const channel = await this.channelsService.findOneById(channelId);
    const isExist = await this.subscriptionsService.exists(user, channel);

    if (!isExist) {
      await this.subscriptionsService.add(user, channel);

      await this.recommendationQueue.add('update-user-interests', {
        userId: user.id,
        targetId: channelId,
        targetType: 'channel',
      });
    }
  }
}
