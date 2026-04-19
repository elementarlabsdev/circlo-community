import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { ThreadsService } from '@/threads/application/services/threads.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('bookmark/thread')
@UseGuards(AuthGuard)
export class BookmarkThreadController {
  constructor(
    private readonly bookmarks: BookmarksService,
    private readonly threads: ThreadsService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id')
  async add(@Req() request: Request, @Param('id') threadId: string) {
    const threadExists = await this.threads.exists(threadId);
    const bookmarkExists = await this.bookmarks.exists(
      request.user,
      threadId,
      'thread',
    );

    if (threadExists && !bookmarkExists) {
      await this.bookmarks.add(request.user, threadId, 'thread');

      await this.recommendationQueue.add('update-user-interests', {
        userId: request.user.id,
        targetId: threadId,
        targetType: 'thread',
      });
    }

    return {};
  }

  @Delete(':id')
  async delete(@Req() request: Request, @Param('id') threadId: string) {
    await this.bookmarks.delete(request.user, threadId, 'thread');

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: threadId,
      targetType: 'thread',
    });

    return {};
  }
}
