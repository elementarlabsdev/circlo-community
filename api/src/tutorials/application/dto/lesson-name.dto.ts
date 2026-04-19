import { IsNotEmpty, IsString } from 'class-validator';

export class LessonNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
