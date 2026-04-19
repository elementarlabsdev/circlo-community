import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { SocialMediaLinkSettingsDto } from '@/platform/application/dtos/social-media-link-settings.dto';

@Controller('admin/settings/social-media-links')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminSocialMediaLinksController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const { socialMediaLinks, availableSocialMediaLinks } =
      await this.platformService.getSocialMediaLinksSettings();
    return { socialMediaLinks, availableSocialMediaLinks };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: SocialMediaLinkSettingsDto) {
    await this.platformService.saveSocialMediaLinksSettings(dto);
    return {};
  }
}
