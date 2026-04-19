import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PlatformService } from '@/platform/application/services/platform.service';

@Controller('admin/settings/ads')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminAdsProviderController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('ads');
    const adsProviders = await this.platformService.getAllAdsProviders();
    return {
      settings,
      adsProviders,
    };
  }

  @Post('provider/update')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveProvider(
    @Body() dto: { type: string; isEnabled?: boolean; config?: any },
  ) {
    const provider = await this.platformService.updateAdsProvider(dto.type, {
      isEnabled: dto.isEnabled,
      config: dto.config ?? dto,
    });
    return { provider };
  }
}
