import { IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateTutorialDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  title: string;

  @IsString()
  @IsOptional()
  description?: string | null;

  @IsString()
  @IsOptional()
  channelId?: string | null;
}
