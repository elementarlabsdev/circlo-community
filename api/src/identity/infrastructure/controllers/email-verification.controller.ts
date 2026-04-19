import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Ip,
  Headers,
} from '@nestjs/common';
import {
  EmailVerificationDto,
  ResendEmailVerificationDto,
} from '@/identity/application/dtos/email-verification.dto';
import { GetEmailByHashUseCase } from '@/identity/application/use-cases/get-email-by-hash.use-case';
import { VerifyEmailUseCase } from '@/identity/application/use-cases/verify-email.use-case';
import { ResendEmailVerificationUseCase } from '@/identity/application/use-cases/resend-email-verification.use-case';

@Controller()
export class EmailVerificationController {
  constructor(
    private readonly getEmailByHashUseCase: GetEmailByHashUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly resendEmailVerificationUseCase: ResendEmailVerificationUseCase,
  ) {}

  @Get('email/:hash/verification')
  async verification(@Param('hash') hash: string) {
    return this.getEmailByHashUseCase.execute(hash);
  }

  @Post('email/:hash/verification')
  async verify(
    @Param('hash') hash: string,
    @Body() emailVerificationDto: EmailVerificationDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.verifyEmailUseCase.execute(hash, emailVerificationDto, {
      ipAddress: ip,
      userAgent: userAgent,
      device: 'web',
    });
  }

  @Post('email/:hash/verification/resend')
  async resend(
    @Param('hash') hash: string,
    @Body() resendEmailVerificationDto: ResendEmailVerificationDto,
    @Ip() ip: string,
  ) {
    return this.resendEmailVerificationUseCase.execute(
      hash,
      resendEmailVerificationDto,
      ip,
    );
  }
}
