import { Global, Module } from '@nestjs/common';
import { FeedService } from '@/feed/application/services/feed.service';
import { FEED_REPOSITORY } from '@/feed/domain/repositories/feed-repository.interface';
import { FeedPrismaRepository } from '@/feed/infrastructure/persistence/feed.prisma.repository';
import { FeedController } from '@/feed/infrastructure/controllers/feed.controller';
import { FeedUserController } from '@/feed/infrastructure/controllers/feed-user.controller';
import { FeedChannelController } from '@/feed/infrastructure/controllers/feed-channel.controller';
import { FeedTopicController } from '@/feed/infrastructure/controllers/feed-topic.controller';
import { GetFeedUseCase } from '@/feed/application/use-cases/get-feed.use-case';
import { GetUserFeedUseCase } from '@/feed/application/use-cases/get-user-feed.use-case';
import { GetTopicFeedUseCase } from '@/feed/application/use-cases/get-topic-feed.use-case';
import { GetChannelFeedUseCase } from '@/feed/application/use-cases/get-channel-feed.use-case';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';

@Global()
@Module({
  imports: [],
  controllers: [
    FeedController,
    FeedUserController,
    FeedChannelController,
    FeedTopicController,
  ],
  providers: [
    FeedService,
    FeedDataEnricher,
    GetFeedUseCase,
    GetUserFeedUseCase,
    GetTopicFeedUseCase,
    GetChannelFeedUseCase,
    { provide: FEED_REPOSITORY, useClass: FeedPrismaRepository },
  ],
  exports: [FeedService],
})
export class FeedModule {}
