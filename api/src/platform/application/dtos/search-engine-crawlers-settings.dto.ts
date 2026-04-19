import { IsNotEmpty } from 'class-validator';

export class SearchEngineCrawlersSettingsDto {
  @IsNotEmpty()
  robotsTxtContent: string;
}
