import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCaptchaProviderDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  siteKey?: string;

  @IsOptional()
  @IsString()
  secretKey?: string;

  @IsOptional()
  @IsBoolean()
  isConfigured?: boolean;
}
