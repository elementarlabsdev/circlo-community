import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class MonetizationSettingsDto {
  @IsBoolean()
  @IsOptional()
  monetizationCreditsEnabled: boolean;

  @IsBoolean()
  @IsOptional()
  monetizationPaidAccountEnabled: boolean;

  @IsNumber()
  @IsOptional()
  monetizationPaidAccountPrice: number;
}
