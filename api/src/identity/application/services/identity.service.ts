import { Injectable } from '@nestjs/common';
import { CreateUserUseCase } from '@/identity/application/use-cases/create-user.use-case';
import { LoginUseCase } from '@/identity/application/use-cases/login.use-case';
import { SyncCookiesUseCase } from '@/identity/application/use-cases/sync-cookies.use-case';
import { CreateUserDto } from '@/identity/application/dtos/create-user.dto';
import { LoginDto } from '@/identity/application/dtos/login.dto';
import { SyncCookiesDto } from '@/identity/application/dtos/sync-cookies.dto';
import { User } from '@/identity/domain/entities/user.entity';
import { IsFirstUserUseCase } from '@/identity/application/use-cases/is-first-user.use-case';
import { SendEmailVerificationCodeUseCase } from '@/identity/application/use-cases/send-email-verification-code.use-case';
import { SendEmailVerificationCodeDto } from '@/identity/application/dtos/send-email-verification-code.dto';
import { SendResetPasswordCodeDto } from '@/identity/application/dtos/send-reset-password-code.dto';
import { SendResetPasswordCodeUseCase } from '@/identity/application/use-cases/send-reset-password-code.use-case';
import { PasswordReset } from '@/identity/domain/entities/password-reset.entity';

@Injectable()
export class IdentityService {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly syncCookiesUseCase: SyncCookiesUseCase,
    private readonly isFirstUserUseCase: IsFirstUserUseCase,
    private readonly sendEmailVerificationCodeUseCase: SendEmailVerificationCodeUseCase,
    private readonly sendResetPasswordCodeUseCase: SendResetPasswordCodeUseCase,
  ) {}

  register(dto: CreateUserDto, remoteIp?: string): Promise<User> {
    return this.createUserUseCase.execute(dto, remoteIp);
  }

  login(dto: LoginDto, context?: any) {
    return this.loginUseCase.execute(dto, context);
  }

  isFirstUser(): Promise<boolean> {
    return this.isFirstUserUseCase.execute();
  }

  sendEmailVerificationCode(
    dto: SendEmailVerificationCodeDto,
  ): Promise<string> {
    return this.sendEmailVerificationCodeUseCase.execute(dto);
  }

  sendResetPasswordCode(dto: SendResetPasswordCodeDto): Promise<PasswordReset> {
    return this.sendResetPasswordCodeUseCase.execute(dto);
  }

  syncCookies(userId: string, dto: SyncCookiesDto): Promise<void> {
    return this.syncCookiesUseCase.execute(userId, dto);
  }
}
