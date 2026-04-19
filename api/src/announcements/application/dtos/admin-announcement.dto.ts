import { IsBoolean, IsDateString, IsInt, IsOptional, IsString, IsUrl } from 'class-validator';

export class AdminAnnouncementDto {
  @IsString()
  name: string;

  @IsString()
  content: string;

  @IsString()
  statusType: string;

  @IsString()
  typeType: string;

  @IsInt()
  @IsOptional()
  priority?: number;

  @IsBoolean()
  @IsOptional()
  dismissable?: boolean;

  @IsBoolean()
  @IsOptional()
  requireManualDismiss?: boolean;

  @IsString()
  @IsOptional()
  targetUrl?: string;

  @IsString()
  @IsOptional()
  actionText?: string;

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;
}
