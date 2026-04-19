import { Controller, Get, Param } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import {
  COMMENTS_REPOSITORY,
  CommentsRepositoryInterface,
} from '@/comments/domain/repositories/comments.repository';
import { Comment } from '@/comments/domain/entities/comment.entity';
import { CommentReactionsService } from '@/comments/application/services/comment-reactions.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Controller('discussion')
export class DiscussionController {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repo: CommentsRepositoryInterface,
    private readonly reactions: CommentReactionsService,
    private readonly settings: SettingsService,
  ) {}

  @Get(':commentId')
  async getDiscussion(
    @Param('commentId') commentId: string,
    @GetUser() user: User | undefined,
  ) {
    const root = await this.repo.findByIdOrFail(commentId);
    const comment = await this.buildThread(root, user);
    const threadCommentsDepth = await this.settings.findValueByName(
      'threadCommentsDepth',
    );
    return {
      comment,
      threadCommentsDepth,
    };
  }

  private async buildThread(entity: Comment, user: User | undefined) {
    const reactions = user
      ? await this.reactions.getReactionsOfComment(entity as any, user)
      : [];
    const children = await this.repo.findRepliesOf(entity.id);
    const replies = await Promise.all(
      children.map((c) => this.buildThread(c, user)),
    );
    // Calculate total number of nested (descendant) replies
    const nestedRepliesCount = replies.reduce(
      (sum, r: any) => sum + 1 + (r.nestedRepliesCount ?? 0),
      0,
    );
    return {
      ...entity.toPrimitives(),
      replies,
      reactions,
      nestedRepliesCount,
    };
  }
}
