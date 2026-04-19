import { IsArray, IsOptional, IsString, Length, ArrayNotEmpty, ArrayUnique } from 'class-validator';
import { IsSameOriginAsHost } from '@/common/application/validators/is-same-origin-as-host.validator';

export class CreateComplaintDto {
  @IsString()
  targetType!: string; // e.g. 'tutorial' | 'publication' | ...

  @IsString()
  targetId!: string;

  // reason is a localization key (code): e.g. 'spam', 'abuse', 'copyright', 'explicit', 'other'
  @IsString()
  @Length(2, 64)
  reason!: string;

  @IsOptional()
  @IsString()
  @Length(0, 5000)
  details?: string;

  // URL of the page where the complaint was reported from (optional)
  @IsOptional()
  @IsString()
  @IsSameOriginAsHost({ message: 'reportedUrl must belong to site host' })
  reportedUrl?: string;

  // Optional attachments — existing MediaItem IDs
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsString({ each: true })
  attachmentIds?: string[];

  // reCAPTCHA token (required for anonymous users)
  @IsOptional()
  @IsString()
  recaptchaToken?: string;

  // CAP JS token (required for anonymous users)
  @IsOptional()
  @IsString()
  captchaToken?: string;
}
