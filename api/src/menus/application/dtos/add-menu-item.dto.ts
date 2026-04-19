import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
} from 'class-validator';

export class AddMenuItemDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  url: string;

  @IsInt()
  position: number;

  @IsBoolean()
  authorisedOnly: boolean;

  @IsOptional()
  @IsUUID()
  iconId?: string;
}
