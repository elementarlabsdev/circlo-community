import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { CookieSettingsDto } from '@/account/application/dtos/cookie-settings.dto';

@Injectable()
export class SaveCookieSettingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: CookieSettingsDto): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        cookieConsent: true,
        cookiePreferences: dto.cookiePreferences || {},
      },
    });
  }
}
