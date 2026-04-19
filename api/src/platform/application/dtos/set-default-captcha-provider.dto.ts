import { IsString } from 'class-validator';

export class SetDefaultCaptchaProviderDto {
  @IsString()
  type: string;
}
