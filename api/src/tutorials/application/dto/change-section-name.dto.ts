import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeSectionNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
