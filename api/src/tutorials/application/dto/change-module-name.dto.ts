import { IsNotEmpty, IsString } from 'class-validator';

export class ChangeModuleNameDto {
  @IsString()
  @IsNotEmpty()
  name: string;
}
