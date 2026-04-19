import { Global, Module } from '@nestjs/common';
import { SubscriptionsController } from './infrastructure/controllers/subscriptions.controller';
import { ChannelSubscriptionController } from './infrastructure/controllers/channel-subscription.controller';
import { TopicSubscriptionController } from './infrastructure/controllers/topic-subscription.controller';
import { UserSubscriptionController } from './infrastructure/controllers/user-subscription.controller';
import { SubscriptionListService } from './application/services/subscription-list.service';
import { SUBSCRIPTION_REPOSITORY } from '@/subscriptions/domain/repositories/subscription-repository.interface';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { ListSubscriptionsUseCase } from '@/subscriptions/application/use-cases/list-subscriptions.use-case';
import { SubscriptionPrismaRepository } from '@/subscriptions/infrastructure/persistence/subscription-prisma.repository';
import { FollowChannelUseCase } from '@/subscriptions/application/use-cases/follow-channel.use-case';
import { UnfollowChannelUseCase } from '@/subscriptions/application/use-cases/unfollow-channel.use-case';
import { FollowTopicUseCase } from '@/subscriptions/application/use-cases/follow-topic.use-case';
import { UnfollowTopicUseCase } from '@/subscriptions/application/use-cases/unfollow-topic.use-case';
import { FollowUserUseCase } from '@/subscriptions/application/use-cases/follow-user.use-case';
import { UnfollowUserUseCase } from '@/subscriptions/application/use-cases/unfollow-user.use-case';

@Global()
@Module({
  imports: [],
  controllers: [
    SubscriptionsController,
    ChannelSubscriptionController,
    TopicSubscriptionController,
    UserSubscriptionController,
  ],
  providers: [
    SubscriptionsService,
    ListSubscriptionsUseCase,
    SubscriptionListService,
    FollowChannelUseCase,
    UnfollowChannelUseCase,
    FollowTopicUseCase,
    UnfollowTopicUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: SubscriptionPrismaRepository,
    },
  ],
  exports: [
    ListSubscriptionsUseCase,
    SubscriptionListService,
    FollowChannelUseCase,
    UnfollowChannelUseCase,
    FollowTopicUseCase,
    UnfollowTopicUseCase,
    FollowUserUseCase,
    UnfollowUserUseCase,
    SubscriptionsService,
    SUBSCRIPTION_REPOSITORY,
  ],
})
export class SubscriptionsModule {}
