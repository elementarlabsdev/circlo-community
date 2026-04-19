import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';

export class BrandingSettingsDto {
  @IsString()
  @IsNotEmpty()
  fontFamily: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  siteLogoUrl?: string;

  @IsOptional()
  @IsUrl({ require_tld: false })
  @Transform(({ value }) => (value === '' ? undefined : value))
  siteIconUrl?: string;
}
