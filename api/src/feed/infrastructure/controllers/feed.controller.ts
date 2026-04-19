import { Controller, Get, Query } from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { FeedListQueryDto } from '@/feed/application/dtos/feed-list-query.dto';
import { GetFeedUseCase } from '@/feed/application/use-cases/get-feed.use-case';

@Controller('feed')
export class FeedController {
  constructor(private readonly getFeedUseCase: GetFeedUseCase) {}

  @Get()
  async list(@GetUser() user: any, @Query() query: FeedListQueryDto) {
    const { type = 'default', page = 1, pageSize = 20 } = query;
    return this.getFeedUseCase.execute({
      user,
      type,
      page,
      pageSize,
    });
  }
}
