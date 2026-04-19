import { IsNotEmpty } from 'class-validator';

export class ChannelDto {
  @IsNotEmpty()
  name: string;

  description: string;

  @IsNotEmpty()
  slug: string;

  logoUrl: string;
}
