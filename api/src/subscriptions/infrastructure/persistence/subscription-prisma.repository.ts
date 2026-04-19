import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SubscriptionRepositoryInterface } from '@/subscriptions/domain/repositories/subscription-repository.interface';

@Injectable()
export class SubscriptionPrismaRepository
  implements SubscriptionRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findPageByFollowerId(
    followerId: string,
    pageNumber: number,
    pageSize: number,
  ) {
    const [rows, totalItems] = await this.prisma.$transaction([
      this.prisma.subscription.findMany({
        where: { followerId },
        orderBy: { createdAt: 'desc' },
        take: pageSize,
        skip: (pageNumber - 1) * pageSize,
        select: {
          targetType: true,
          targetId: true,
        },
      }),
      this.prisma.subscription.count({ where: { followerId } }),
    ]);

    const entities = rows.map((r) => ({
      targetType: r.targetType as any,
      targetId: r.targetId,
    }));

    return { entities, totalItems };
  }
}
