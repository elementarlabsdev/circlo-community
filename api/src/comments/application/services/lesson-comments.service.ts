import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { Comment } from '../../domain/entities/comment.entity';
import { CommentReactionsService } from './comment-reactions.service';
import { CommentDto } from '../dto/comment.dto';
import {
  COMMENTS_REPOSITORY,
  CommentsRepositoryInterface,
} from '@/comments/domain/repositories/comments.repository';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';

@Injectable()
export class LessonCommentsService {
  constructor(
    @Inject(COMMENTS_REPOSITORY)
    private readonly repo: CommentsRepositoryInterface,
    private readonly commentReactions: CommentReactionsService,
    private readonly prisma: PrismaService,
    private readonly notificationManager: NotificationsManagerService,
    private readonly websocketGateway: DefaultGateway,
  ) {}

  async findAllByLessonId(id: string, user: User = null) {
    const entities = await this.repo.findAllByLessonId(id);
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
    lessonId: string,
    commentDto: CommentDto,
    author: User,
  ): Promise<any> {
    const lesson: any = await this.prisma.lesson.findUniqueOrThrow({
      where: { id: lessonId },
      include: {
        tutorial: { include: { author: true } },
        sectionItem: {
          include: {
            section: { include: { tutorial: { include: { author: true } } } },
          },
        },
      },
    });

    const comment = await this.repo.createRootForLesson(
      lesson.id,
      commentDto.htmlContent || commentDto.content,
      author.id,
    );
    await this.repo.incrementLessonComments(lesson.id, 1);
    const tutorial = lesson.tutorial ?? lesson.sectionItem?.section?.tutorial;
    if (tutorial?.id) {
      await this.repo.incrementTutorialComments(tutorial.id, 1);
    }

    // Notifications to lesson author (if exists)
    const lessonAuthor = tutorial?.author;
    if (lessonAuthor) {
      await this.notificationManager.createOrUpdateNotification({
        userId: lessonAuthor.id,
        type: NotificationType.NEW_COMMENT,
        actor: {
          id: author.id,
          name: (author as any).name,
          username: (author as any).username,
          avatarUrl: (author as any).avatarUrl,
        },
        entity: {
          id: lesson.id,
          type: 'lesson',
          name: lesson.name,
        },
        additionalData: {
          comment: {
            id: comment.id,
            htmlContent: comment.htmlContent,
          },
          lesson: {
            id: lesson.id,
            name: lesson.name,
            slug: lesson.slug,
          },
          tutorial: tutorial
            ? { id: tutorial.id, title: tutorial.title, slug: tutorial.slug }
            : undefined,
        },
      });
    }

    const reactions = await this.commentReactions.getReactionsOfComment(
      comment as any,
      author,
    );
    const result = {
      ...comment.toPrimitives(),
      replies: [],
      reactions,
    };
    this.websocketGateway.sendAddCommentToLesson(
      author.id,
      lesson.id,
      result as any,
    );
    return result;
  }

  async delete(commentId: string) {
    const comment = await this.repo.findByIdOrFail(commentId);

    if (comment.respondingTo) {
      await this.repo.updateRepliesCount(comment.respondingTo.id, -1);
    }

    const lessonId = (comment as any).lesson?.id || (comment as any).lessonId;
    if (lessonId) {
      await this.repo.incrementLessonComments(lessonId, -1);
      const lesson: any = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { sectionItem: { include: { section: true } } },
      });
      const tutorialId = lesson?.tutorialId || lesson?.sectionItem?.section?.tutorialId;
      if (tutorialId) {
        await this.repo.incrementTutorialComments(tutorialId, -1);
      }
    }
    await this.repo.deleteById(commentId);
  }

  async reply(
    commentId: string,
    commentDto: CommentDto,
    author: User,
  ): Promise<any> {
    const respondTo = await this.repo.findByIdOrFail(commentId);
    const comment = await this.repo.createReply(
      respondTo,
      commentDto.htmlContent || commentDto.content,
      author.id,
    );

    const lessonId =
      (respondTo as any).lesson?.id || (respondTo as any).lessonId;
    if (lessonId) {
      await this.repo.incrementLessonComments(lessonId, 1);
      const lesson: any = await this.prisma.lesson.findUnique({
        where: { id: lessonId },
        include: { sectionItem: { include: { section: true } } },
      });
      const tutorialId = lesson?.tutorialId || lesson?.sectionItem?.section?.tutorialId;
      if (tutorialId) {
        await this.repo.incrementTutorialComments(tutorialId, 1);
      }
    }
    await this.repo.updateRepliesCount(respondTo.id, 1);

    // Notify original comment author
    await this.notificationManager.createOrUpdateNotification({
      userId: (respondTo as any).author.id,
      type: NotificationType.REPLY_COMMENT,
      actor: {
        id: (author as any).id,
        name: (author as any).name,
        username: (author as any).username,
        avatarUrl: (author as any).avatarUrl,
      },
      entity: {
        id: (respondTo as any).id,
        type: 'comment',
      },
      additionalData: {
        respondTo: {
          id: (respondTo as any).id,
          htmlContent: (respondTo as any).htmlContent,
        },
        comment: {
          id: (comment as any).id,
          htmlContent: (comment as any).htmlContent,
        },
        lesson: lessonId ? { id: lessonId } : undefined,
      },
    });

    const reactions = await this.commentReactions.getReactionsOfComment(
      comment as any,
      author,
    );
    const result = {
      ...comment.toPrimitives(),
      replies: [],
      reactions,
    };
    this.websocketGateway.sendAddReplyToCommentInLesson(
      author.id,
      lessonId,
      respondTo.id,
      result as any,
    );
    return result;
  }
}
