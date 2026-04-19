import { IsNotEmpty, IsString } from 'class-validator';

export class QuizNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
