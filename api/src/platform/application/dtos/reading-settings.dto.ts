import { IsNotEmpty, IsNumber } from 'class-validator';

export class ReadingSettingsDto {
  @IsNotEmpty()
  @IsNumber()
  publicationsPerPage: number;

  @IsNotEmpty()
  @IsNumber()
  topicsPerPage: number;

  @IsNotEmpty()
  @IsNumber()
  channelsPerPage: number;

  @IsNotEmpty()
  publicationsShowOnFront: 'latest';

  @IsNotEmpty()
  feedType: 'standard' | 'smart';
}
