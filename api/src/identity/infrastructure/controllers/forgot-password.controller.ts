import { Body, Controller, Get, Inject, Post, Ip } from '@nestjs/common';
import { ForgotPasswordDto } from '@/identity/application/dtos/forgot-password.dto';
import { IdentityService } from '@/identity/application/services/identity.service';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/identity/domain/repositories/user-repository.interface';
import { CaptchaValidationService } from '@/identity/application/services/captcha-validation.service';

@Controller('identity/forgot-password')
export class ForgotPasswordController {
  constructor(
    private readonly identityService: IdentityService,
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    private readonly captchaValidation: CaptchaValidationService,
  ) {}

  @Get()
  async index() {
    return {};
  }

  @Post()
  async check(
    @Body() forgotPasswordDto: ForgotPasswordDto,
    @Ip() ip: string,
  ) {
    await this.captchaValidation.validate(forgotPasswordDto, ip);

    const user = await this.userRepository.findByEmail(forgotPasswordDto.email);

    if (user && !user.isBlocked && !user.isDeactivated && user.verified) {
      const passwordReset = await this.identityService.sendResetPasswordCode({
        user,
      });
      return {
        valid: true,
        hash: passwordReset.hash,
        verified: passwordReset.verified,
      };
    }

    return {
      valid: false,
    };
  }
}
