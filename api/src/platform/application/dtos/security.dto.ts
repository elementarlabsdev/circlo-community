import { IsNotEmpty, IsNumber } from 'class-validator';

export class SecurityDto {
  @IsNumber()
  @IsNotEmpty()
  emailVerificationIntervalBetweenSendsTime: number;

  @IsNumber()
  @IsNotEmpty()
  emailVerificationSentCount: number;

  @IsNumber()
  @IsNotEmpty()
  emailVerificationBlockTime: number;
}
