import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CookieSettingsRepositoryInterface } from '@/identity/domain/repositories/cookie-settings-repository.interface';

@Injectable()
export class CookieSettingsRepository
  implements CookieSettingsRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async createDefaultForUser(userId: string): Promise<void> {
    await this.prisma.cookieSettings.upsert({
      where: { userId },
      create: {
        user: { connect: { id: userId } },
        allowFunctionalCookies: false,
        allowTargetingCookies: false,
        allowPerformanceCookies: false,
      },
      update: {},
    });
  }
}
