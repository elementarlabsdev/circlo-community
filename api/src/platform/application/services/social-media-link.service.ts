import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class SocialMediaLinkService {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly prisma: PrismaService,
  ) {}

  async findAllActive() {
    const socialMediaLinks = await this.settingsService.findValueByName(
      'socialMediaLinks',
    );
    const result = [] as any[];

    for (const socialMediaLink of socialMediaLinks) {
      if (socialMediaLink.url.trim() !== '') {
        const availableSocialMediaLink = await this.prisma.socialMediaLink.findUnique({
          where: {
            type: socialMediaLink.type,
          },
        });
        result.push({
          ...availableSocialMediaLink,
          ...socialMediaLink,
        });
      }
    }

    return result;
  }
}
