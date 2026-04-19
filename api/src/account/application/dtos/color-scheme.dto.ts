import { IsNotEmpty } from 'class-validator';

export class ColorSchemeDto {
  @IsNotEmpty()
  colorScheme: string;
}
