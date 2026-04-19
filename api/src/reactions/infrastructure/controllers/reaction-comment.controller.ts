import {
  Controller,
  Delete,
  Param,
  Post,
  Req,
  UseGuards,
  Inject,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ReactionsCatalogService } from '@/reactions/application/services/reactions-catalog.service';
import {
  REACTION_LIST_REPOSITORY,
  ReactionListRepositoryInterface,
} from '@/reactions/domain/repositories/reaction-list.repository';
import { CommentsService } from '@/comments/application/services/comments.service';

@Controller('reaction/comment')
@UseGuards(AuthGuard)
export class ReactionCommentController {
  constructor(
    private readonly commentsService: CommentsService,
    private readonly reactionsCatalog: ReactionsCatalogService,
    private readonly prisma: PrismaService,
    @Inject(REACTION_LIST_REPOSITORY)
    private readonly reactionListRepo: ReactionListRepositoryInterface,
  ) {}

  @Post(':commentId/:reactionId')
  async add(
    @Req() request: Request,
    @Param('commentId') commentId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    const comment = await this.commentsService.findByIdOrFail(commentId);
    const exists = await this.reactionListRepo.exists(
      request.user.id,
      'comment',
      commentId,
      reaction.id,
    );

    if (!exists) {
      await this.reactionListRepo.add(
        request.user.id,
        'comment',
        commentId,
        reaction.id,
      );
      await this.prisma.comment.update({
        where: { id: comment.id },
        data: { reactionsCount: { increment: 1 } },
      });
    }

    return {};
  }

  @Delete(':commentId/:reactionId')
  async delete(
    @Req() request: Request,
    @Param('commentId') commentId: string,
    @Param('reactionId') reactionId: string,
  ) {
    const reaction = await this.reactionsCatalog.findOneByIdOrFail(reactionId);
    await this.reactionListRepo.delete(
      request.user.id,
      'comment',
      commentId,
      reaction.id,
    );
    await this.prisma.comment.update({
      where: { id: commentId },
      data: { reactionsCount: { decrement: 1 } },
    });
    return {};
  }
}
