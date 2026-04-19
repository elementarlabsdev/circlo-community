import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GetCookieSettingsUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        cookieConsent: true,
        cookiePreferences: true,
      },
    });
    const cookieConsentSettings = await this.settingsService.findValueByName('cookieConsent');
    return {
      cookieConsent: user?.cookieConsent || false,
      cookiePreferences: user?.cookiePreferences || {},
      cookieConsentSettings,
    };
  }
}
