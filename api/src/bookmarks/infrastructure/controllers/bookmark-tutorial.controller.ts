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
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('bookmark/tutorial')
@UseGuards(AuthGuard)
export class BookmarkTutorialController {
  constructor(
    private readonly bookmarks: BookmarksService,
    private readonly tutorials: TutorialsService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id')
  async add(@Req() request: Request, @Param('id') tutorialId: string) {
    const tutorialExists = await this.tutorials.exists(tutorialId);
    const bookmarkExists = await this.bookmarks.exists(
      request.user,
      tutorialId,
      'tutorial',
    );

    if (tutorialExists && !bookmarkExists) {
      await this.bookmarks.add(request.user, tutorialId, 'tutorial');

      await this.recommendationQueue.add('update-user-interests', {
        userId: request.user.id,
        targetId: tutorialId,
        targetType: 'tutorial',
      });
    }

    return {};
  }

  @Delete(':id')
  async delete(@Req() request: Request, @Param('id') tutorialId: string) {
    await this.bookmarks.delete(request.user, tutorialId, 'tutorial');

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: tutorialId,
      targetType: 'tutorial',
    });

    return {};
  }
}
