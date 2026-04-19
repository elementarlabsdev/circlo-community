import { Global, Module } from '@nestjs/common';
import { PublicationsModule } from '@/publications/publications.module';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { BookmarkListService } from '@/bookmarks/application/services/bookmark-list.service';
import { BOOKMARK_REPOSITORY } from '@/bookmarks/domain/repositories/bookmark-repository.interface';
import { BookmarksPrismaRepository } from '@/bookmarks/infrastructure/persistence/bookmarks.prisma.repository';
import { ReactionsService } from '@/reactions/application/services/reactions.service';
import { BookmarkTutorialController } from '@/bookmarks/infrastructure/controllers/bookmark-tutorial.controller';
import { BookmarksController } from '@/bookmarks/infrastructure/controllers/bookmarks.controller';
import { BookmarkPublicationController } from '@/bookmarks/infrastructure/controllers/bookmark-publication.controller';
import { BookmarkThreadController } from '@/bookmarks/infrastructure/controllers/bookmark-thread.controller';
import { ThreadsModule } from '@/threads/threads.module';

@Global()
@Module({
  imports: [PublicationsModule, ThreadsModule],
  controllers: [
    BookmarkPublicationController,
    BookmarkTutorialController,
    BookmarkThreadController,
    BookmarksController,
  ],
  providers: [
    BookmarksService,
    BookmarkListService,
    ReactionsService,
    { provide: BOOKMARK_REPOSITORY, useClass: BookmarksPrismaRepository },
  ],
  exports: [BookmarksService, BookmarkListService],
})
export class BookmarksModule {}
