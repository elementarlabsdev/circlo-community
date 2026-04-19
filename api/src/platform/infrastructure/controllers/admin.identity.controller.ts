import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { IdentityDto } from '@/platform/application/dtos/identity.dto';

@Controller('admin/settings/identity')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminIdentityController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getIdentitySettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: IdentityDto) {
    await this.platformService.saveIdentitySettings(dto);
    return {};
  }
}
