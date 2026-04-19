import { IsBoolean, IsNotEmpty } from 'class-validator';

export class ResendMailProviderDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsNotEmpty()
  apiKey: string;
}
