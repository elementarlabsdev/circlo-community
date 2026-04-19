import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { SearchEngineCrawlersSettingsDto } from '@/platform/application/dtos/search-engine-crawlers-settings.dto';

@Controller('admin/settings/search-engine-crawlers')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminSearchEngineCrawlersController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings =
      await this.platformService.getSearchEngineCrawlersSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: SearchEngineCrawlersSettingsDto) {
    await this.platformService.saveSearchEngineCrawlersSettings(dto);
    return {};
  }
}
