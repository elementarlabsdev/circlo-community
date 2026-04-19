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
import { PublicationsService } from '@/publications/application/services/publications.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('bookmark/publication')
@UseGuards(AuthGuard)
export class BookmarkPublicationController {
  constructor(
    private readonly bookmarks: BookmarksService,
    private readonly publications: PublicationsService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Post(':id')
  async add(@Req() request: Request, @Param('id') publicationId: string) {
    const publicationExists = await this.publications.exists(publicationId);
    const bookmarkExists = await this.bookmarks.exists(
      request.user,
      publicationId,
      'publication',
    );

    if (publicationExists && !bookmarkExists) {
      await this.bookmarks.add(request.user, publicationId, 'publication');

      await this.recommendationQueue.add('update-user-interests', {
        userId: request.user.id,
        targetId: publicationId,
        targetType: 'publication',
      });
    }

    return {};
  }

  @Delete(':id')
  async delete(@Req() request: Request, @Param('id') publicationId: string) {
    await this.bookmarks.delete(request.user, publicationId, 'publication');

    await this.recommendationQueue.add('update-user-interests', {
      userId: request.user.id,
      targetId: publicationId,
      targetType: 'publication',
    });

    return {};
  }
}
