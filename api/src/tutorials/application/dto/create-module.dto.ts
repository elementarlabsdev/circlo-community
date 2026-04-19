import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateModuleDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsInt()
  position: number;
}
