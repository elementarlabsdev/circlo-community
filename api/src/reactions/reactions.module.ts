import { Global, Module } from '@nestjs/common';
import { REACTIONS_REPOSITORY } from '@/reactions/domain/repositories/reactions.repository';
import { ReactionsPrismaRepository } from '@/reactions/infrastructure/persistence/reactions.prisma.repository';
import { REACTION_LIST_REPOSITORY } from '@/reactions/domain/repositories/reaction-list.repository';
import { ReactionListPrismaRepository } from '@/reactions/infrastructure/persistence/reaction-list.prisma.repository';
import { ReactionPublicationController } from '@/reactions/infrastructure/controllers/reaction-publication.controller';
import { ReactionCommentController } from '@/reactions/infrastructure/controllers/reaction-comment.controller';
import { ReactionTutorialController } from '@/reactions/infrastructure/controllers/reaction-tutorial.controller';
import { ReactionThreadController } from '@/reactions/infrastructure/controllers/reaction-thread.controller';
import { ReactionsCatalogService } from '@/reactions/application/services/reactions-catalog.service';
import { CommentReactionsAppService } from '@/reactions/application/services/comment-reactions.service';
import { ReactionsService } from '@/reactions/application/services/reactions.service';
import { CommentsService } from '@/comments/application/services/comments.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';

@Global()
@Module({
  imports: [],
  controllers: [
    ReactionPublicationController,
    ReactionCommentController,
    ReactionTutorialController,
    ReactionThreadController,
  ],
  providers: [
    CommentsService,
    { provide: REACTIONS_REPOSITORY, useClass: ReactionsPrismaRepository },
    {
      provide: REACTION_LIST_REPOSITORY,
      useClass: ReactionListPrismaRepository,
    },
    ReactionsService,
    ReactionsPrismaRepository,
    ReactionListPrismaRepository,
    ReactionsCatalogService,
    TargetReactionsService,
    CommentReactionsAppService,
  ],
  exports: [
    REACTIONS_REPOSITORY,
    REACTION_LIST_REPOSITORY,
    ReactionsCatalogService,
    TargetReactionsService,
    CommentReactionsAppService,
    ReactionsService,
  ],
})
export class ReactionsModule {}
