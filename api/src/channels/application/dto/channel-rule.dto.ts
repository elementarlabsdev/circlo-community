import { IsNotEmpty, IsString } from 'class-validator';

export class ChannelRuleDto {
  id?: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  description: string;
}
