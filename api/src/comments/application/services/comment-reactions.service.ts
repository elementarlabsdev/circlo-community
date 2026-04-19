import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Reaction, User } from '@prisma/client';
import { ReactionsService } from '@/reactions/application/services/reactions.service';

@Injectable()
export class CommentReactionsService {
  constructor(
    private _prisma: PrismaService,
    private _reactionsService: ReactionsService,
  ) {}

  async getReactionsOfComment(comment: any, actor: User): Promise<Reaction[]> {
    const reactions = await this._prisma.reaction.findMany({
      orderBy: {
        position: 'asc',
      },
    });
    const results = [] as any[];

    for (const reaction of reactions) {
      let hasReaction = false;

      if (actor) {
        hasReaction = await this._reactionsService.exists(
          actor,
          'comment',
          comment.id,
          reaction,
        );
      }

      const totalCount = await this._prisma.reactionList.count({
        where: {
          targetId: comment.id,
          targetType: 'comment',
          reaction: {
            id: reaction.id,
          },
        },
      });
      results.push({
        reaction,
        totalCount,
        hasReaction,
      });
    }

    return results as any;
  }
}
