import { IsNotEmpty } from 'class-validator';
import { ChannelRuleDto } from './channel-rule.dto';

export class CreateChannelDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  slug: string;

  description: string;
  logoUrl: string;
  logoId: string;
  visibilityId: string;
  accessType: string;
  price: number;
  moderatorIds: string[];
  ownerId: string;
  rules: ChannelRuleDto[];
  metaTitle: string;
  metaDescription: string;
}
