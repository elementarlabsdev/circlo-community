import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLessonDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  @Min(0)
  @Type(() => Number)
  position: number;

  @IsOptional()
  @IsUrl()
  contentUrl?: string;

  @IsOptional()
  @IsString()
  contentText?: string;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isFreePreview?: boolean = false;
}
