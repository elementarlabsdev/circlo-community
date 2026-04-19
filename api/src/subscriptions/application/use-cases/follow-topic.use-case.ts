import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { TopicsService } from '@/topics/application/services/topics.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class FollowTopicUseCase {
  constructor(
    private readonly topicsService: TopicsService,
    private readonly subscriptionsService: SubscriptionsService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  async execute(user: User, topicId: string): Promise<void> {
    const topic = await this.topicsService.findOneById(topicId);
    const isExist = await this.subscriptionsService.exists(user, topic);

    if (!isExist) {
      await this.subscriptionsService.add(user, topic);

      await this.recommendationQueue.add('update-user-interests', {
        userId: user.id,
        targetId: topicId,
        targetType: 'topic',
      });
    }
  }
}
