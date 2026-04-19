import { IsBoolean, IsOptional } from 'class-validator';

export class SyncCookiesDto {
  @IsBoolean()
  cookieConsent: boolean;

  @IsOptional()
  cookiePreferences?: any;
}
