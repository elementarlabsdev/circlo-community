import { IsNotEmpty, IsNumber } from 'class-validator';

class SocialMediaLink {
  @IsNotEmpty()
  id: string;

  url: string;

  @IsNumber()
  position: number;
}

export class SocialMediaLinkSettingsDto {
  socialMediaLinks: SocialMediaLink[];
}
