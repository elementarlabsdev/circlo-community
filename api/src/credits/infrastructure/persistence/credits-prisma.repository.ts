import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class CreditsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createTransaction(data: {
    userId: string;
    amount: number;
    type: string;
    details?: any;
  }) {
    return await this.prisma.$transaction(async (tx) => {
      // Create the transaction record
      const transaction = await tx.creditTransaction.create({
        data: {
          userId: data.userId,
          amount: data.amount,
          type: data.type,
          details: data.details,
        },
      });

      // Update user credits
      await tx.user.update({
        where: { id: data.userId },
        data: {
          credits: {
            increment: data.amount,
          },
        },
      });

      return transaction;
    });
  }

  async findByUserId(userId: string) {
    return await this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByPaymentId(paymentId: string) {
    return await this.prisma.creditTransaction.findFirst({
      where: {
        details: {
          path: ['paymentId'],
          equals: paymentId,
        },
      },
    });
  }

  async findAll(params: { skip?: number; take?: number } = {}) {
    return await this.prisma.creditTransaction.findMany({
      ...params,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async countAll() {
    return await this.prisma.creditTransaction.count();
  }
}
