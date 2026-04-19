import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { GetChannelFeedUseCase } from '@/feed/application/use-cases/get-channel-feed.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('channel')
export class FeedChannelController {
  constructor(
    private readonly getChannelFeedUseCase: GetChannelFeedUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get(':slug')
  async feed(
    @GetUser() requestUser: any,
    @Param('slug') slug: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    const result = await this.getChannelFeedUseCase.execute({
      requestUser,
      slug,
      pageNumber,
    });

    if (requestUser && result.channel) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: requestUser.id,
        targetId: result.channel.id,
        targetType: 'channel',
      });
    }

    return result;
  }
}
