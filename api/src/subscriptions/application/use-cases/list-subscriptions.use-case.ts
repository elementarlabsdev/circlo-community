import { Injectable, Inject } from '@nestjs/common';
import { ListSubscriptionsResult } from '../../domain/subscription.types';
import {
  SUBSCRIPTION_REPOSITORY,
  SubscriptionRepositoryInterface,
} from '@/subscriptions/domain/repositories/subscription-repository.interface';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { TopicsService } from '@/topics/application/services/topics.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class ListSubscriptionsUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepositoryInterface,
    private readonly channelsService: ChannelsService,
    private readonly topicsService: TopicsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(input: any): Promise<ListSubscriptionsResult> {
    const pageSize = input.pageSize ?? 20;
    const { entities, totalItems } =
      await this.subscriptionRepository.findPageByFollowerId(
        input.user.id,
        input.pageNumber,
        pageSize,
      );

    const items: ListSubscriptionsResult['items'] = [];
    const subscriptions: any[] = [];
    const bookmarks: any[] = [];

    for (const entity of entities) {
      if (entity.targetType === 'channel') {
        const channel = await this.channelsService.findOneById(entity.targetId);
        const subscription = await this.subscriptionsService.get(
          input.user,
          channel,
        );
        items.push({ type: entity.targetType, channel, subscription });
        subscriptions.push(subscription);
      } else if (entity.targetType === 'topic') {
        const topic = await this.topicsService.findOneById(entity.targetId);
        const subscription = await this.subscriptionsService.get(
          input.user,
          topic,
        );
        items.push({ type: entity.targetType, topic, subscription });
        subscriptions.push(subscription);
      }
    }

    return {
      items,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / pageSize),
        pageSize,
        pageNumber: input.pageNumber,
      },
      subscriptions,
      bookmarks,
    };
  }
}
