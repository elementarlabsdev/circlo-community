import {
  IsArray,
  ArrayMaxSize,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TopicDto {
  @IsString()
  @IsOptional()
  id?: string;

  // name is required only if id is not provided
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class TutorialSettingsDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120, { message: 'Slug must not exceed 120 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'Slug may contain only lowercase Latin letters, digits, and hyphens; no spaces or special characters',
  })
  slug: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  whatYouWillLearn?: string[] | null;

  // SEO/meta (not saving for now, but accepting from form)
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  channelId?: string;

  @IsString()
  @IsOptional()
  licenseTypeId?: string;

  @IsBoolean()
  @IsOptional()
  discussionEnabled?: boolean;

  @IsBoolean()
  @IsOptional()
  pinned?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TopicDto)
  @ArrayMaxSize(6, { message: 'topics must contain at most 6 items' })
  @IsOptional()
  topics?: TopicDto[];
}
