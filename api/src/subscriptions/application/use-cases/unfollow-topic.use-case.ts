import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { TopicsService } from '@/topics/application/services/topics.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class UnfollowTopicUseCase {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly subscriptionsService: SubscriptionsService,
  ) {}

  async execute(user: User, topicId: string): Promise<void> {
    const topic = await this.topicsService.findOneById(topicId);
    const isExist = await this.subscriptionsService.exists(user, topic);

    if (isExist) {
      await this.subscriptionsService.remove(user, topic);
    }
  }
}
