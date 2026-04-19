import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ReactionListRepositoryInterface } from '../../domain/repositories/reaction-list.repository';
import { ReactionList } from '../../domain/entities/reaction-list.entity';

@Injectable()
export class ReactionListPrismaRepository
  implements ReactionListRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  private map(row: any): ReactionList {
    return ReactionList.fromPersistence(row);
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

  async countByTarget(
    targetType: string,
    targetId: string,
    reactionId?: string,
  ): Promise<number> {
    return this.prisma.reactionList.count({
      where: { targetType, targetId, ...(reactionId ? { reactionId } : {}) },
    });
  }

  async listByTarget(
    targetType: string,
    targetId: string,
  ): Promise<ReactionList[]> {
    const rows = await this.prisma.reactionList.findMany({
      where: { targetType, targetId },
      include: { actor: true, reaction: true },
    });
    return rows.map((r) => this.map(r));
  }
}
