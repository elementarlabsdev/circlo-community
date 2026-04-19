import { IsNotEmpty, Length, Matches } from 'class-validator';

export class ChangeEmailConfirmDto {
  @IsNotEmpty()
  @Length(6, 6)
  @Matches(/^[0-9]+$/)
  code: string;
}
