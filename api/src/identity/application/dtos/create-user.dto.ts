import { IsNotEmpty, IsEmail, MinLength, IsOptional, IsBoolean } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  preferredColorScheme: 'light' | 'dark' | 'system';

  @IsOptional()
  @IsBoolean()
  cookieConsent?: boolean;

  @IsOptional()
  cookiePreferences?: any;

  @IsOptional()
  captchaToken?: string;

  @IsOptional()
  recaptchaToken?: string;

  @IsOptional()
  username?: string;
}
