import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { GetUserFeedUseCase } from '@/feed/application/use-cases/get-user-feed.use-case';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('user')
export class FeedUserController {
  constructor(
    private readonly getUserFeedUseCase: GetUserFeedUseCase,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get(':username')
  async feed(
    @GetUser() requestUser: any,
    @Param('username') username: string,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    const result = await this.getUserFeedUseCase.execute({
      requestUser,
      username,
      pageNumber,
    });

    if (requestUser && result.user) {
      await this.recommendationQueue.add('update-user-interests', {
        userId: requestUser.id,
        targetId: result.user.id,
        targetType: 'user',
      });
    }

    return result;
  }
}
