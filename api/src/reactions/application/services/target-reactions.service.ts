import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  REACTION_LIST_REPOSITORY,
  ReactionListRepositoryInterface,
} from '@/reactions/domain/repositories/reaction-list.repository';
import {
  REACTIONS_REPOSITORY,
  ReactionsRepositoryInterface,
} from '@/reactions/domain/repositories/reactions.repository';
import { User } from '@prisma/client';

@Injectable()
export class TargetReactionsService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(REACTION_LIST_REPOSITORY)
    private readonly reactionListRepo: ReactionListRepositoryInterface,
    @Inject(REACTIONS_REPOSITORY)
    private readonly reactionsRepo: ReactionsRepositoryInterface,
  ) {}

  async getReactions(
    targetId: string,
    targetType: string,
    actor?: User,
  ): Promise<any[]> {
    const reactions = await this.reactionsRepo.findAll();
    const results: any[] = [];

    for (const reaction of reactions) {
      let hasReaction = false;

      if (actor) {
        hasReaction = await this.reactionListRepo.exists(
          actor.id,
          targetType,
          targetId,
          reaction.id,
        );
      }

      const totalCount = await this.prisma.reactionList.count({
        where: {
          targetId,
          targetType,
          reactionId: reaction.id,
        },
      });

      results.push({
        reaction: reaction.toPrimitives(),
        totalCount,
        hasReaction,
      });
    }

    return results;
  }
}
