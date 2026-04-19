import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { GetTopicFeedUseCase } from '@/feed/application/use-cases/get-topic-feed.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('topic')
export class FeedTopicController {
  constructor(
    private readonly getTopicFeedUseCase: GetTopicFeedUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get(':slug')
  async feed(
    @GetUser() requestUser: any,
    @Param('slug') slug: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    const result = await this.getTopicFeedUseCase.execute({
      requestUser,
      slug,
      pageNumber,
    });

    if (requestUser && result.topic) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: requestUser.id,
        targetId: result.topic.id,
        targetType: 'topic',
      });
    }

    return result;
  }
}
