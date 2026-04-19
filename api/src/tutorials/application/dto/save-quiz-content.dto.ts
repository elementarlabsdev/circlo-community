import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class SaveQuizOptionDto {
  @IsString()
  text!: string;

  // Whether this option is correct
  isCorrect!: boolean;
}

export enum SaveQuizQuestionType {
  SINGLE = 'single',
  MULTIPLE = 'multiple',
}

export class SaveQuizQuestionDto {
  @IsEnum(SaveQuizQuestionType)
  type!: SaveQuizQuestionType;

  @IsString()
  text!: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  imageId?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuizOptionDto)
  options!: SaveQuizOptionDto[];
}

export class SaveQuizContentDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SaveQuizQuestionDto)
  questions!: SaveQuizQuestionDto[];
}
