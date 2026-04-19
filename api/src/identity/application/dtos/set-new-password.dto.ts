import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

 export class SetNewPasswordDto {
   @IsNotEmpty()
   password: string;

   @IsNotEmpty()
   confirmPassword: string;

   @IsOptional()
   @IsString()
   captchaToken?: string;

   @IsOptional()
   @IsString()
   recaptchaToken?: string;
 }
