import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { DiscussionSettingsDto } from '@/platform/application/dtos/discussion-settings.dto';

@Controller('admin/settings/discussion')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminDiscussionController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getDiscussionSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: DiscussionSettingsDto) {
    await this.platformService.saveDiscussionSettings(dto);
    return {};
  }
}
