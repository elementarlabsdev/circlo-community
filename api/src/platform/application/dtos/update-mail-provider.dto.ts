import { IsInt, IsOptional, IsString } from 'class-validator';

export class UpdateMailProviderDto {
  @IsOptional()
  @IsInt()
  position?: number;

  @IsOptional()
  @IsString()
  description?: string;
}
