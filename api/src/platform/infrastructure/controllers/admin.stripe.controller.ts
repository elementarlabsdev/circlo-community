import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';
import { StripeSettingsDto } from '@/platform/application/dtos/stripe-settings.dto';

@Controller('admin/settings/stripe')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminStripeController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('stripe');
    return {
      stripePublishableKey: settings.stripePublishableKey ?? '',
      stripeSecretKey: settings.stripeSecretKey ?? '',
      stripeWebhookSecret: settings.stripeWebhookSecret ?? '',
      stripeApplicationFeeAmount: settings.stripeApplicationFeeAmount ?? 10,
    };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: StripeSettingsDto) {
    const isConfigured = !!(dto.stripePublishableKey && dto.stripeSecretKey);
    await this.settingsService.save({ ...dto, stripeConfigured: isConfigured }, 'stripe');
    return { success: true };
  }
}
