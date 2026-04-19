import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmailChangeRepositoryInterface } from '../../domain/repositories/email-change-repository.interface';
import { EmailChange } from '../../domain/entities/email-change.entity';

@Injectable()
export class PrismaEmailChangeRepository
  implements EmailChangeRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async upsert(change: EmailChange): Promise<void> {
    await this.prisma.emailChange.upsert({
      where: { userId: change.userId },
      create: {
        userId: change.userId,
        newEmail: change.newEmail,
        codeHash: change.codeHash,
        expiresAt: change.expiresAt,
      },
      update: {
        newEmail: change.newEmail,
        codeHash: change.codeHash,
        expiresAt: change.expiresAt,
      },
    });
  }

  async findByUserId(userId: string): Promise<EmailChange | null> {
    const rec = await this.prisma.emailChange.findUnique({ where: { userId } });
    if (!rec) return null;
    return EmailChange.create({
      userId: rec.userId,
      newEmail: rec.newEmail,
      codeHash: rec.codeHash,
      expiresAt: rec.expiresAt,
      createdAt: rec.createdAt,
    });
  }

  async deleteByUserId(userId: string): Promise<void> {
    await this.prisma.emailChange.delete({ where: { userId } }).catch(() => {});
  }
}
