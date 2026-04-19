import { IsBoolean, IsNotEmpty, IsString } from 'class-validator';

export class AwsSesMailProviderDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsString()
  @IsNotEmpty()
  accessKeyId: string;

  @IsString()
  @IsNotEmpty()
  secretAccessKey: string;

  @IsString()
  @IsNotEmpty()
  region: string;
}
