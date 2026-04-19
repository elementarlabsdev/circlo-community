import { Global, Module } from '@nestjs/common';
import { PublicationCommentsService } from './application/services/publication-comments.service';
import { CommentReactionsService } from './application/services/comment-reactions.service';
import { COMMENTS_REPOSITORY } from '@/comments/domain/repositories/comments.repository';
import { PublicationCommentsController } from '@/comments/infrastructure/controllers/publication-comments.controller';
import { AdminCommentsController } from '@/comments/infrastructure/controllers/admin-comments.controller';
import { CommentsPrismaRepository } from '@/comments/infrastructure/persistence/comments.prisma.repository';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { CommentsDataTableService } from '@/comments/application/services/comments-data-table.service';
import { CommentsService } from '@/comments/application/services/comments.service';
import { ReactionsService } from '@/reactions/application/services/reactions.service';
import { CommentsTableService } from '@/comments/application/services/comments-table.service';
import { CommentListService } from '@/comments/application/services/comment-list.service';
import { LessonCommentsController } from '@/comments/infrastructure/controllers/lesson-comments.controller';
import { LessonCommentsService } from '@/comments/application/services/lesson-comments.service';
import { DiscussionController } from '@/comments/infrastructure/controllers/discussion.controller';

@Global()
@Module({
  imports: [],
  controllers: [
    PublicationCommentsController,
    AdminCommentsController,
    LessonCommentsController,
    DiscussionController,
  ],
  providers: [
    // repositories
    { provide: COMMENTS_REPOSITORY, useClass: CommentsPrismaRepository },
    CommentsPrismaRepository,

    // services
    CommentsService,
    CommentsTableService,
    CommentListService,
    ReactionsService,
    CommentReactionsService,
    PublicationCommentsService,
    LessonCommentsService,
    CommentsDataTableService,
    { provide: DataTableService, useClass: CommentsDataTableService },
  ],
  exports: [
    PublicationCommentsService,
    LessonCommentsService,
    CommentReactionsService,
    CommentsService,
  ],
})
export class CommentsModule {}
