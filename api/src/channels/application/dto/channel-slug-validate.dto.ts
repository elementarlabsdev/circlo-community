import { IsNotEmpty } from 'class-validator';

export class ChannelSlugValidateDto {
  channelId: string | null;

  @IsNotEmpty()
  slug: string;
}
