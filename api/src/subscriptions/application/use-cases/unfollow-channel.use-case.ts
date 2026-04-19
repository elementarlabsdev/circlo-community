import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class UnfollowChannelUseCase {
  constructor(
    private readonly channelsService: ChannelsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(user: User, channelId: string): Promise<void> {
    const channel = await this.channelsService.findOneById(channelId);
    const isExist = await this.subscriptionsService.exists(user, channel);

    if (isExist) {
      await this.subscriptionsService.remove(user, channel);
    }
  }
}
