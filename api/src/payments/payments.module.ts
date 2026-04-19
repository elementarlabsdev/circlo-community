import { Global, Module } from '@nestjs/common';
import { StripeService } from '@/payments/application/services/stripe.service';
import { SubscriptionCronService } from '@/payments/application/services/subscription-cron.service';
import { PaymentsController } from '@/payments/infrastructure/controllers/payments.controller';
import { SettingsModule } from '@/settings/settings.module';

@Global()
@Module({
  imports: [SettingsModule],
  controllers: [PaymentsController],
  providers: [StripeService, SubscriptionCronService],
  exports: [StripeService],
})
export class PaymentsModule {}
