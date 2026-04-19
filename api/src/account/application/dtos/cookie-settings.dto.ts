import { IsBoolean, IsNotEmpty, IsOptional } from 'class-validator';

export class CookieSettingsDto {
  @IsBoolean()
  @IsOptional()
  allowFunctionalCookies?: boolean;

  @IsBoolean()
  @IsOptional()
  allowTargetingCookies?: boolean;

  @IsBoolean()
  @IsOptional()
  allowPerformanceCookies?: boolean;

  @IsOptional()
  cookiePreferences?: any;
}
