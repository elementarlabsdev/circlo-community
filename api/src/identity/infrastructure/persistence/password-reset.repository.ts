import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { PasswordReset } from '@/identity/domain/entities/password-reset.entity';
import { PasswordResetRepositoryInterface } from '@/identity/domain/repositories/password-reset-repository.interface';

@Injectable()
export class PasswordResetRepository
  implements PasswordResetRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(args: {
    where: { userId: string };
  }): Promise<PasswordReset | null> {
    const record = await this.prisma.passwordReset.findUnique({
      where: { userId: args.where.userId },
    });
    if (!record) return null;
    return PasswordReset.reconstitute({
      id: record.id,
      userId: record.userId,
      code: record.code,
      hash: record.hash,
      createdAt: record.createdAt,
      verified: record.verified,
      // prisma has typo field names: condeSentCount, codeSentLastTimeAt
      sentAt: record.codeSentLastTimeAt,
      sentCount: record.condeSentCount,
    });
  }

  async create(reset: PasswordReset): Promise<PasswordReset> {
    const data = reset.toPrimitives();
    const created = await this.prisma.passwordReset.create({
      data: {
        // id in prisma has default, pass only if provided
        ...(data.id ? { id: data.id } : {}),
        userId: data.userId,
        code: data.code,
        hash: data.hash,
        verified: data.verified,
        condeSentCount: data.sentCount,
        codeSentLastTimeAt: data.sentAt,
        createdAt: data.createdAt,
      },
    });
    return PasswordReset.reconstitute({
      id: created.id,
      userId: created.userId,
      code: created.code,
      hash: created.hash,
      createdAt: created.createdAt,
      verified: created.verified,
      sentAt: created.codeSentLastTimeAt,
      sentCount: created.condeSentCount,
    });
  }

  async update(reset: PasswordReset): Promise<PasswordReset> {
    const data = reset.toPrimitives();
    const updated = await this.prisma.passwordReset.update({
      where: { userId: data.userId },
      data: {
        code: data.code,
        hash: data.hash,
        verified: data.verified,
        condeSentCount: data.sentCount,
        codeSentLastTimeAt: data.sentAt,
        createdAt: data.createdAt,
      },
    });
    return PasswordReset.reconstitute({
      id: updated.id,
      userId: updated.userId,
      code: updated.code,
      hash: updated.hash,
      createdAt: updated.createdAt,
      verified: updated.verified,
      sentAt: updated.codeSentLastTimeAt,
      sentCount: updated.condeSentCount,
    });
  }

  async save(reset: PasswordReset): Promise<void> {
    const data = reset.toPrimitives();
    await this.prisma.passwordReset.upsert({
      where: { userId: data.userId },
      update: {
        code: data.code,
        hash: data.hash,
        verified: data.verified,
        condeSentCount: data.sentCount,
        codeSentLastTimeAt: data.sentAt,
        createdAt: data.createdAt,
      },
      create: {
        id: data.id,
        userId: data.userId,
        code: data.code,
        hash: data.hash,
        verified: data.verified,
        condeSentCount: data.sentCount,
        codeSentLastTimeAt: data.sentAt,
        createdAt: data.createdAt,
      },
    });
  }
}
