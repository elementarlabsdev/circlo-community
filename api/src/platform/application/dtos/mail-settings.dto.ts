import { IsNotEmpty } from 'class-validator';

export class MailSettingsDto {
  @IsNotEmpty()
  mailDomain: string;

  @IsNotEmpty()
  mailFrom: string;

  @IsNotEmpty()
  systemEmail: string;

  @IsNotEmpty()
  supportEmail: string;
}
