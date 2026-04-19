import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';
import { MonetizationSettingsDto } from '@/platform/application/dtos/monetization-settings.dto';

@Controller('admin/settings/monetization')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminMonetizationController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('monetization');
    const stripeSettings = await this.settingsService.findAllFlatten('stripe');
    return {
      monetizationCreditsEnabled: settings.monetizationCreditsEnabled ?? false,
      monetizationPaidAccountEnabled: settings.monetizationPaidAccountEnabled ?? false,
      monetizationPaidAccountPrice: settings.monetizationPaidAccountPrice ?? 0,
      stripeConfigured: stripeSettings.stripeConfigured ?? false,
    };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: MonetizationSettingsDto) {
    const isStripeConfigured = await this.settingsService.findValueByName('stripeConfigured', false);

    if (dto.monetizationPaidAccountEnabled && !isStripeConfigured) {
      throw new Error('Stripe is not configured');
    }

    await this.settingsService.save({ ...dto }, 'monetization');
    return { success: true };
  }
}
