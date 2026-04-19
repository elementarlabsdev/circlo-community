import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentReactionsService } from './comment-reactions.service';
import { CommentDto } from '../dto/comment.dto';
import { TextQualityQueue } from '@/text-quality/text-quality.queue';
import {
  COMMENTS_REPOSITORY,
  CommentsRepositoryInterface,
} from '@/comments/domain/repositories/comments.repository';

@Injectable()
export class PublicationCommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repo: CommentsRepositoryInterface,
    private readonly commentReactions: CommentReactionsService,
    private readonly textQualityQueue: TextQualityQueue,
  ) {}

  async findAllByPublicationId(id: string, user: User = null) {
    const entities = await this.repo.findAllByPublicationId(id);
    const result = [] as any[];

    for (const entity of entities) {
      const reactions = user
        ? await this.commentReactions.getReactionsOfComment(entity as any, user)
        : [];
      const replies =
        entity.repliesCount > 0 ? await this.getReplies(entity, user) : [];
      const nestedRepliesCount = replies.reduce(
        (sum, r: any) => sum + 1 + (r.nestedRepliesCount ?? 0),
        0,
      );
      result.push({
        ...entity.toPrimitives(),
        replies,
        reactions,
        nestedRepliesCount,
      });
    }

    return result;
  }

  async getReplies(respondingTo: Comment, user: User = null) {
    const entities = await this.repo.findRepliesOf(respondingTo.id);
    const replies = [] as any[];

    for (const entity of entities) {
      const reactions = user
        ? await this.commentReactions.getReactionsOfComment(entity as any, user)
        : [];
      const childReplies =
        entity.repliesCount > 0 ? await this.getReplies(entity, user) : [];
      const nestedRepliesCount = childReplies.reduce(
        (sum, r: any) => sum + 1 + (r.nestedRepliesCount ?? 0),
        0,
      );
      replies.push({
        ...entity.toPrimitives(),
        replies: childReplies,
        reactions,
        nestedRepliesCount,
      });
    }

    return replies;
  }

  async findByIdOrFail(id: string) {
    return this.repo.findByIdOrFail(id);
  }

  async add(
    commentDto: CommentDto,
    publication: any,
    author: User,
  ): Promise<any> {
    const comment = await this.repo.createRoot(
      publication.id,
      commentDto.htmlContent || commentDto.content,
      author.id,
    );

    await this.repo.incrementPublicationComments(publication.id, 1);
    const reactions = await this.commentReactions.getReactionsOfComment(
      comment as any,
      author,
    );

    await this.textQualityQueue.analyzeComment(comment.id);

    return {
      ...comment.toPrimitives(),
      replies: [],
      reactions,
    };
  }

  async delete(commentId: string) {
    const comment = await this.repo.findByIdOrFail(commentId);

    if (comment.respondingTo) {
      await this.repo.updateRepliesCount(comment.respondingTo.id, -1);
    }

    await this.repo.incrementPublicationComments(comment.publication.id, -1);
    await this.repo.deleteById(commentId);
  }

  async reply(
    commentDto: CommentDto,
    respondingTo: any,
    author: User,
  ): Promise<any> {
    const comment = await this.repo.createReply(
      respondingTo,
      commentDto.htmlContent || commentDto.content,
      author.id,
    );

    await this.repo.incrementPublicationComments(
      respondingTo.publication.id,
      1,
    );
    await this.repo.updateRepliesCount(respondingTo.id, 1);
    const reactions = await this.commentReactions.getReactionsOfComment(
      comment as any,
      author,
    );

    await this.textQualityQueue.analyzeComment(comment.id);

    return {
      ...comment.toPrimitives(),
      replies: [],
      reactions,
    };
  }
}
