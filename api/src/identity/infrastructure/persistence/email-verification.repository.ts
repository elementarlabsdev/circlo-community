import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmailVerificationRepositoryInterface } from '@/identity/domain/repositories/email-verification-repository.interface';
import { EmailVerification } from '@/identity/domain/entities/email-verification.entity';

@Injectable()
export class EmailVerificationRepository
  implements EmailVerificationRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async save(emailVerification: EmailVerification): Promise<void> {
    const data = emailVerification.toPrimitives();

    // userId is unique in Prisma schema, so we upsert by userId to keep only one active record per user
    await this.prisma.emailVerification.upsert({
      where: { userId: data.userId },
      update: {
        code: data.code,
        hash: data.hash,
        createdAt: data.createdAt,
        sentAt: data.sentAt,
        sentCount: data.sentCount,
        blockedUntil: data.blockedUntil ?? null,
        expireAt: data.expireAt,
      },
      create: {
        id: data.id,
        userId: data.userId,
        code: data.code,
        hash: data.hash,
        createdAt: data.createdAt,
        sentAt: data.sentAt,
        sentCount: data.sentCount,
        blockedUntil: data.blockedUntil ?? null,
        expireAt: data.expireAt,
      },
    });
  }
}
