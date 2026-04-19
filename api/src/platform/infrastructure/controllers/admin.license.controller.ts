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

@Controller('admin/settings/license')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminLicenseController {
  constructor(
    private readonly platformService: PlatformService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getLicenseSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: any) {
    if (dto.licenseKey !== undefined) {
      await this.platformService.saveLicenseSettings({ licenseKey: dto.licenseKey });
    }
    return {};
  }
}
