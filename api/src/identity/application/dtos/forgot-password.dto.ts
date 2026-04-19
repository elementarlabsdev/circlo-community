import { IsNotEmpty, IsEmail, IsOptional, IsString } from 'class-validator';

 export class ForgotPasswordDto {
   @IsNotEmpty()
   @IsEmail()
   email: string;

   @IsOptional()
   @IsString()
   captchaToken?: string;

   @IsOptional()
   @IsString()
   recaptchaToken?: string;
 }
