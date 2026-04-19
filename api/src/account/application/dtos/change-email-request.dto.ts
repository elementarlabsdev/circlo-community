import { IsEmail, IsNotEmpty } from 'class-validator';

export class ChangeEmailRequestDto {
  @IsNotEmpty()
  @IsEmail()
  newEmail: string;
}
