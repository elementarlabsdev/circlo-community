import { IsBoolean, IsNotEmpty } from 'class-validator';

export class IdentityDto {
  @IsBoolean()
  @IsNotEmpty()
  isPublicCommunity: boolean;

  @IsBoolean()
  @IsNotEmpty()
  registrationEnabled: boolean;

  @IsBoolean()
  @IsNotEmpty()
  oAuthEnabled: boolean;
}
