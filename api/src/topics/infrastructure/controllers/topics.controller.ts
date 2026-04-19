import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { TopicListService } from '@/topics/application/services/topic-list.service';

@Controller('topics')
export class TopicsController {
  constructor(private _topicListService: TopicListService) {}

  @Get()
  async handle(
    @GetUser() user: any,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    return await this._topicListService.getLatest(user, pageNumber);
  }
}
