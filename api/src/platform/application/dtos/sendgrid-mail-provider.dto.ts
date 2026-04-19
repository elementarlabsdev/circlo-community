import { IsBoolean, IsNotEmpty } from 'class-validator';

export class SendgridMailProviderDto {
  @IsBoolean()
  isEnabled: boolean;

  @IsNotEmpty()
  apiKey: string;
}
