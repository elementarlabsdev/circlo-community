import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { I18nService } from 'nestjs-i18n';
import { LoginDto } from '../dtos/login.dto';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/identity/domain/repositories/user-repository.interface';
import {
  ROLE_REPOSITORY,
  RoleRepositoryInterface,
} from '@/identity/domain/repositories/role-repository.interface';
import { Role } from '@/identity/domain/entities/role.entity';
import {
  LOGIN_SESSION_REPOSITORY,
  LoginSessionRepositoryInterface,
} from '@/identity/domain/repositories/login-session-repository.interface';
import { LoginSession } from '@/identity/domain/entities/login-session.entity';
import { LoginContext } from '@/identity/application/dtos/login-context';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SendEmailVerificationCodeUseCase } from '@/identity/application/use-cases/send-email-verification-code.use-case';
import { SettingsService } from '@/settings/application/services/settings.service';
import { AbilityFactory } from '@/identity/application/services/ability.factory';

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryInterface,
    private readonly jwtService: JwtService,
    @Inject(LOGIN_SESSION_REPOSITORY)
    private readonly loginSessionRepository: LoginSessionRepositoryInterface,
    private readonly prisma: PrismaService,
    private readonly sendEmailVerificationCodeUseCase: SendEmailVerificationCodeUseCase,
    private readonly settingsService: SettingsService,
    private readonly abilityFactory: AbilityFactory,
    private readonly i18n: I18nService,
  ) {}

  async execute(
    dto: LoginDto,
    ctx?: LoginContext,
  ): Promise<{
    id: string;
    name: string;
    accessToken: string;
    role: Role;
    email: string;
    avatarUrl?: string | null;
    username: string;
    preferredColorScheme: string;
    isPaid: boolean;
    rules: any[];
  }> {
    const user = await this.userRepository.findByEmail(dto.email);

    if (!user) {
      throw new UnauthorizedException({
        type: 'invalidCredentials',
        message: await this.i18n.t('errors.invalid_credentials'),
      });
    }

    const role = await this.roleRepository.findById(user.roleId);

    const isPasswordValid = await user.verifyPassword(dto.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException({
        type: 'invalidCredentials',
        message: await this.i18n.t('errors.invalid_credentials'),
      });
    }

    if (user.isBlocked) {
      throw new UnauthorizedException({
        type: 'accountBlocked',
        message: await this.i18n.t('errors.account_blocked'),
      });
    }

    if (!user.verified) {
      const emailVerification = await this.prisma.emailVerification.findUnique({
        where: { userId: user.id },
      });
      let hash: string;

      if (!emailVerification) {
        hash = await this.sendEmailVerificationCodeUseCase.execute({ user });
      } else {
        hash = emailVerification.hash;
      }
      throw new UnauthorizedException({
        type: 'accountNotVerified',
        message: await this.i18n.t('errors.account_not_verified'),
        hash,
      });
    }

    if (dto.cookieConsent !== undefined) {
      user.updateCookieConsent(dto.cookieConsent, dto.cookiePreferences);
    }

    return this._completeLogin(user, role, ctx);
  }

  async loginByEmail(
    email: string,
    ctx?: LoginContext,
  ): Promise<{
    id: string;
    name: string;
    accessToken: string;
    role: Role;
    email: string;
    avatarUrl?: string | null;
    username: string;
    preferredColorScheme: string;
    isPaid: boolean;
    rules: any[];
  }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException({
        type: 'invalidCredentials',
        message: await this.i18n.t('errors.invalid_credentials'),
      });
    }

    const role = await this.roleRepository.findById(user.roleId);

    return this._completeLogin(user, role, ctx);
  }

  private async _completeLogin(
    user: any,
    role: Role,
    ctx?: LoginContext,
  ): Promise<{
    id: string;
    name: string;
    accessToken: string;
    role: Role;
    email: string;
    avatarUrl?: string | null;
    username: string;
    preferredColorScheme: string;
    isPaid: boolean;
    rules: any[];
  }> {
    const monetizationPaidAccountEnabledRaw =
      await this.settingsService.findValueByName(
        'monetizationPaidAccountEnabled',
        false,
      );
    const monetizationPaidAccountEnabled =
      monetizationPaidAccountEnabledRaw === 'true' ||
      monetizationPaidAccountEnabledRaw === true;

    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId: user.id,
        status: 'completed',
        publicationId: null,
        tutorialId: null,
      },
    });

    const isPaid =
      !monetizationPaidAccountEnabled ||
      user.isSuperAdmin ||
      role.type === 'admin' ||
      !!purchase;

    const payload = { email: user.email.value, id: user.id };
    const accessToken = await this.jwtService.signAsync(payload);

    user.recordActivity();
    await this.userRepository.save(user);

    // Log login session
    try {
      const session = LoginSession.create({
        userId: user.id,
        device: ctx?.device || 'web',
        ipAddress: ctx?.ipAddress || '',
        userAgent: ctx?.userAgent ?? null,
        location: ctx?.location ?? null,
        isCurrent: true,
      });
      await this.loginSessionRepository.create(session);
    } catch {
      // Do not block login if session logging fails
    }

    const rules = (await this.abilityFactory.createForUser(user)).rules;

    return {
      accessToken,
      role,
      id: user.id,
      name: user.name,
      email: user.email.value,
      avatarUrl: user.avatarUrl,
      username: user.username,
      preferredColorScheme: user.preferredColorScheme,
      isPaid,
      rules,
    };
  }
}
