import { IsNotEmpty, IsString } from 'class-validator';

export class MediaViewDto {
  @IsNotEmpty()
  @IsString()
  mediaView: string;
}
