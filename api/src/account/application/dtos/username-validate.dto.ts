import { IsNotEmpty } from 'class-validator';

export class UsernameValidateDto {
  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  userId: string;
}
