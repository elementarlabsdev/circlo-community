import { IsNotEmpty } from 'class-validator';

export class GeneralSettingsDto {
  @IsNotEmpty()
  siteName: string;

  @IsNotEmpty()
  siteTitle: string;

  metaDescription: string;
  copyright: string;
  siteLogoFileId: string;
  siteIconFileId: string;
}
