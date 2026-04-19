import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class AdminDeleteUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('User not found');
    if (existing.isSuperAdmin) throw new ForbiddenException('Super admin cannot be deleted');

    // Delete dependent entities first to satisfy FK constraints, then delete the user
    await this.prisma.$transaction([
      this.prisma.securitySettings.deleteMany({ where: { userId: id } }),
      this.prisma.notificationSettings.deleteMany({ where: { userId: id } }),
      this.prisma.cookieSettings.deleteMany({ where: { userId: id } }),
      this.prisma.emailVerification.deleteMany({ where: { userId: id } }),
      this.prisma.loginSession.deleteMany({ where: { userId: id } }),
      this.prisma.loginHistory.deleteMany({ where: { userId: id } }),
      this.prisma.passwordReset.deleteMany({ where: { userId: id } }),
      this.prisma.recentVisit.deleteMany({ where: { userId: id } }),
      this.prisma.userOAuthLoginProvider.deleteMany({ where: { userId: id } }),
      this.prisma.user.delete({ where: { id } }),
    ]);

    return { id };
  }
}
