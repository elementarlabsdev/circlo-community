import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EmailVerificationDto {
  @IsNumber()
  @IsNotEmpty()
  code: number;

  @IsOptional()
  @IsString()
  captchaToken?: string;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}

export class ResendEmailVerificationDto {
  @IsOptional()
  @IsString()
  captchaToken?: string;

  @IsOptional()
  @IsString()
  recaptchaToken?: string;
}
