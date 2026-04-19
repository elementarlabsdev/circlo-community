import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class SaveMenuItemDto {
  @IsOptional()
  @IsString()
  id: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsInt()
  position: number;

  @IsBoolean()
  authorisedOnly: boolean;

  @IsOptional()
  @IsString()
  iconUrl: string;
}

export class SaveMenuDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveMenuItemDto)
  items!: SaveMenuItemDto[];
}
