import { Controller, UseGuards, Get } from '@nestjs/common';
import { SettingsService } from '@/settings/application/services/settings.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('settings/admin/customization')
export class CustomizationEditController {
  constructor(private settingsService: SettingsService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('theming');
    return {
      settings,
    };
  }
}
