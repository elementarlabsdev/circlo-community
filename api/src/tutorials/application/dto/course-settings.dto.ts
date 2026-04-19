import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class TutorialSettingsDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  // price: number;
}
