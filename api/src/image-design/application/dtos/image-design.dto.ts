import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreateImageDesignDto {
  @IsOptional()
  @IsString()
  name?: string;
}

export class UpdateImageDesignDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  resultImageUrl?: string;

  @IsOptional()
  snapshot?: any;
}

export class UpdateImageDesignResultImageUrlDto {
  @IsNotEmpty()
  @IsString()
  resultImageUrl: string;
}
