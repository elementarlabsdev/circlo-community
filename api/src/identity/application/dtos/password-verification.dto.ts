import { IsNotEmpty, IsNumber } from 'class-validator';

export class PasswordVerificationDto {
  @IsNotEmpty()
  @IsNumber()
  code: number;
}
