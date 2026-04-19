import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ReactionsRepositoryInterface } from '../../domain/repositories/reactions.repository';
import { Reaction } from '../../domain/entities/reaction.entity';

@Injectable()
export class ReactionsPrismaRepository implements ReactionsRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private map(row: any): Reaction {
    return Reaction.fromPersistence(row);
  }

  async findAll(): Promise<Reaction[]> {
    const rows = await this.prisma.reaction.findMany({ orderBy: { position: 'asc' } });
    return rows.map((r) => this.map(r));
  }

  async findByIdOrFail(id: string): Promise<Reaction> {
    const row = await this.prisma.reaction.findUniqueOrThrow({ where: { id } });
    return this.map(row);
  }

  async add(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<void> {
    await this.prisma.reactionList.create({
      data: {
        actor: { connect: { id: actorId } },
        targetType,
        targetId,
        reaction: { connect: { id: reactionId } },
      },
    });
  }

  async exists(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<boolean> {
    const count = await this.prisma.reactionList.count({
      where: { actorId, targetType, targetId, reactionId },
    });
    return count > 0;
  }

  async delete(
    actorId: string,
    targetType: string,
    targetId: string,
    reactionId: string,
  ): Promise<void> {
    await this.prisma.reactionList.deleteMany({
      where: { actorId, targetType, targetId, reactionId },
    });
  }
}
