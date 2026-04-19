import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmailVerificationDto } from '@/identity/application/dtos/email-verification.dto';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';
import { LoginUseCase } from '@/identity/application/use-cases/login.use-case';
import { LoginContext } from '@/identity/application/dtos/login-context';

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly captchaValidation: CaptchaValidationService,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  async execute(
    hash: string,
    dto: EmailVerificationDto,
    ctx: LoginContext,
  ): Promise<{ valid: boolean; accessToken?: string; [key: string]: any }> {
    await this.captchaValidation.validate(dto, ctx.ipAddress);

    const emailVerification =
      await this.prisma.emailVerification.findUnique({
        where: { hash },
        include: {
          user: {
            select: {
              id: true,
              email: true,
            },
          },
        },
      });

    if (!emailVerification) {
      throw new NotFoundException('Verification not found');
    }

    let valid = false;
    let loginData = null;

    if (emailVerification.code === +dto.code) {
      valid = true;
      await this.prisma.$transaction([
        this.prisma.user.update({
          where: {
            id: emailVerification.user.id,
          },
          data: {
            verified: true,
          },
        }),
        this.prisma.emailVerification.delete({
          where: {
            id: emailVerification.id,
          },
        }),
      ]);

      // Login the user after successful verification
      loginData = await this.loginUseCase.loginByEmail(
        emailVerification.user.email,
        ctx,
      );
    }

    return {
      valid,
      ...loginData,
    };
  }
}
