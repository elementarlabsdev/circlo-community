import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Reaction, User } from '@prisma/client';

@Injectable()
export class ReactionsService {
  constructor(private _prisma: PrismaService) {}

  async getAll() {
    return this._prisma.reaction.findMany({
      where: {

      },
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findAll() {
    return this._prisma.reaction.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  async findOneByIdOrFail(id: string) {
    return this._prisma.reaction.findUniqueOrThrow({
      where: {
        id,
      },
    });
  }

  async add(actor: User, targetType: string, targetId: string, reaction: any) {
    return this._prisma.reactionList.create({
      data: {
        actor: {
          connect: {
            id: actor.id,
          },
        },
        targetType,
        targetId,
        reaction: {
          connect: {
            id: reaction.id,
          },
        },
      },
    });
  }

  async exists(
    actor: User,
    targetType: string,
    targetId: string,
    reaction: Reaction,
  ): Promise<boolean> {
    return (
      (await this._prisma.reactionList.count({
        where: {
          actorId: actor.id,
          targetType,
          targetId,
          reactionId: reaction.id,
        },
      })) > 0
    );
  }

  async delete(
    actor: User,
    targetType: string,
    targetId: string,
    reaction: any,
  ): Promise<void> {
    await this._prisma.reactionList.deleteMany({
      where: {
        actorId: actor.id,
        targetType,
        targetId,
        reactionId: reaction.id,
      },
    });
  }
}
