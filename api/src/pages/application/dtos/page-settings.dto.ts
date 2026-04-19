import { IsNotEmpty } from 'class-validator';

export class PageSettingsDto {
  @IsNotEmpty()
  slug: string;

  metaTitle: string;
  metaDescription: string;
}
