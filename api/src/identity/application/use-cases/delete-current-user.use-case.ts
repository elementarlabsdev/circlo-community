import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

export type DeleteCurrentUserResult =
  | { ok: true }
  | { ok: false; code: 'USER_NOT_FOUND' | 'SUPER_ADMIN_CANNOT_BE_DELETED' };

@Injectable()
export class DeleteCurrentUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<DeleteCurrentUserResult> {
    const existing = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!existing) return { ok: false, code: 'USER_NOT_FOUND' };
    if (existing.isSuperAdmin) return { ok: false, code: 'SUPER_ADMIN_CANNOT_BE_DELETED' };

    await this.prisma.$transaction([
      this.prisma.securitySettings.deleteMany({ where: { userId } }),
      this.prisma.notificationSettings.deleteMany({ where: { userId } }),
      this.prisma.cookieSettings.deleteMany({ where: { userId } }),
      this.prisma.user.delete({ where: { id: userId } }),
    ]);

    return { ok: true };
  }
}
