import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { GeneralSettingsDto } from '@/platform/application/dtos/general-settings.dto';
import { SettingsService } from '@/settings/application/services/settings.service';

@Controller('admin/settings/general')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminGeneralController {
  constructor(
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getGeneralSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: any) {
    const generalKeys: (keyof GeneralSettingsDto | string)[] = [
      'siteName',
      'siteTitle',
      'metaDescription',
      'copyright',
      'siteLogoFileId',
      'siteIconFileId',
    ];
    const generalPayload: Record<string, any> = {};

    for (const key of generalKeys) {
      if (dto[key] !== undefined) generalPayload[key as string] = dto[key];
    }

    if (Object.keys(generalPayload).length) {
      await this.platformService.saveGeneralSettings(generalPayload);
    }

    return {};
  }
}
