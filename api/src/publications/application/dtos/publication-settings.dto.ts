import {
  IsNotEmpty,
  IsArray,
  IsBoolean,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class PublicationSettingsDto {
  @IsNotEmpty()
  authorId: string;

  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  channelId: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120, { message: 'Slug must not exceed 120 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/u, {
    message:
      'Slug may contain only lowercase Latin letters, digits, and hyphens; no spaces or special characters',
  })
  slug: string;

  @IsNotEmpty()
  licenseTypeId: string;

  @IsBoolean()
  discussionEnabled: boolean;

  @IsBoolean()
  pinned: boolean;

  @IsArray()
  topics: TopicDto[];
}

export class TopicDto {
  @IsNotEmpty()
  id: string;

  @IsNotEmpty()
  name: string;
}
