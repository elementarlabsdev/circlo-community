import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class StripeSettingsDto {
  @IsString()
  @IsNotEmpty()
  stripePublishableKey: string;

  @IsString()
  @IsNotEmpty()
  stripeSecretKey: string;

  @IsString()
  stripeWebhookSecret: string;

  @IsNotEmpty()
  @IsNumber()
  stripeApplicationFeeAmount: number;
}
