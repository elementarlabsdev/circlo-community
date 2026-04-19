import { IsArray, IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';

export class CreateThreadDto {
  @ValidateIf(o => !o.mediaItemIds || o.mediaItemIds.length === 0)
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  mediaItemIds?: string[];

  @IsOptional()
  @IsString()
  parentId?: string;
}
