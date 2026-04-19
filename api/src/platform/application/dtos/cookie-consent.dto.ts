import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CookieCategoryDto {
  @IsNumber()
  id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  shortDescription: string;

  @IsString()
  @IsOptional()
  detailedDescription: string;

  @IsBoolean()
  isMandatory: boolean;

  @IsBoolean()
  isExpanded: boolean;
}

export class CookieConsentDto {
  @IsString()
  @IsNotEmpty()
  bannerTitle: string;

  @IsString()
  @IsNotEmpty()
  messageText: string;

  @IsString()
  @IsNotEmpty()
  acceptLabel: string;

  @IsString()
  @IsNotEmpty()
  declineLabel: string;

  @IsString()
  @IsNotEmpty()
  position: string;

  @IsBoolean()
  closeOnOverlayClick: boolean;

  @IsBoolean()
  autoCloseTimer: boolean;

  @IsNumber()
  delay: number;

  @IsArray()
  categories: CookieCategoryDto[];
}
