import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { ContentSettingsDto } from '@/platform/application/dtos/content-settings.dto';

@Controller('admin/settings/content')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminContentController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getContentSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: ContentSettingsDto) {
    await this.platformService.saveContentSettings(dto);
    return {};
  }
}
