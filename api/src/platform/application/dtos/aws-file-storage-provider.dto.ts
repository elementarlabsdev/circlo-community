import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AwsFileStorageProviderDto {
  @IsOptional()
  @IsBoolean()
  isEnabled?: boolean;

  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @IsString()
  @IsNotEmpty()
  bucket: string;

  @IsString()
  @IsNotEmpty()
  region: string;

  @IsOptional()
  @IsBoolean()
  useAcl?: boolean;

  @IsOptional()
  @IsBoolean()
  cdnEnabled?: boolean;
}
