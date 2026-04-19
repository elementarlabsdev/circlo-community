import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/identity/domain/repositories/user-repository.interface';
import {
  ROLE_REPOSITORY,
  RoleRepositoryInterface,
} from '@/identity/domain/repositories/role-repository.interface';
import { User } from '@/identity/domain/entities/user.entity';
import {
  COOKIE_SETTINGS_REPOSITORY,
  CookieSettingsRepositoryInterface,
} from '@/identity/domain/repositories/cookie-settings-repository.interface';
import { UserAccountStatus } from '@/identity/domain/value-objects/user-account-status.vo';
import { CaptchaValidationService } from '../services/captcha-validation.service';

@Injectable()
export class CreateUserUseCase {
  private readonly DEFAULT_USER_ROLE_TYPE = 'user';
  private readonly ADMIN_USER_ROLE_TYPE = 'admin';

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepository: RoleRepositoryInterface,
    @Inject(COOKIE_SETTINGS_REPOSITORY)
    private readonly cookieSettingsRepository: CookieSettingsRepositoryInterface,
    private readonly captchaValidation: CaptchaValidationService,
  ) {}

  async execute(dto: CreateUserDto, remoteIp?: string): Promise<User> {
    const isCreatingFirstUser = (await this.userRepository.countAll()) === 0;

    // Validate captcha if not the first user (first user is usually created via setup or when no users exist)
    if (!isCreatingFirstUser) {
      await this.captchaValidation.validate(
        {
          captchaToken: dto.captchaToken,
          recaptchaToken: dto.recaptchaToken,
        },
        remoteIp,
      );
    }

    if (await this.userRepository.findByEmail(dto.email)) {
      throw new ConflictException({
        type: 'emailAlreadyInUse',
        message: 'This email is already in use.',
      });
    }

    const role = isCreatingFirstUser
      ? await this.roleRepository.findByType(this.ADMIN_USER_ROLE_TYPE)
      : await this.roleRepository.findByType(this.DEFAULT_USER_ROLE_TYPE);

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const uniqueUsername = await this.findUniqueUsername(
      dto.email.split('@')[0],
    );
    const user = User.create({
      id: uuidv4(),
      email: dto.email,
      passwordHash,
      roleId: role.id,
      profile: {
        name: dto.name,
        username: uniqueUsername,
        preferredColorScheme: dto.preferredColorScheme,
      },
      registrationProvider: 'email',
      accountStatus: UserAccountStatus.create({
        isSuperAdmin: isCreatingFirstUser,
        verified: isCreatingFirstUser,
      }),
    });

    if (dto.cookieConsent !== undefined) {
      user.updateCookieConsent(dto.cookieConsent, dto.cookiePreferences);
    }

    await this.userRepository.save(user);
    await this.cookieSettingsRepository.createDefaultForUser(user.id);
    return user;
  }

  private async findUniqueUsername(base: string): Promise<string> {
    // Sanitize base according to username rules from UserProfile (3-20 chars, [a-zA-Z0-9_\-])
    const sanitize = (value: string): string => {
      if (!value) return 'user';
      // Replace any disallowed characters with underscore
      let v = value.replace(/[^a-zA-Z0-9_\-]+/g, '_');
      // Collapse multiple underscores/hyphens
      v = v.replace(/[_-]{2,}/g, (m) =>
        m.includes('-') && m.includes('_') ? '_' : m[0],
      );
      // Trim underscores/hyphens at the ends
      v = v.replace(/^[_-]+|[_-]+$/g, '');
      // Ensure not empty
      if (!v) v = 'user';
      // Enforce max length 20
      if (v.length > 20) v = v.slice(0, 20);
      // Ensure min length 3 by padding with underscores if needed
      while (v.length < 3) v += '_';
      return v;
    };

    const baseSanitized = sanitize(base);
    let username = baseSanitized;
    let counter = 1;

    // Ensure uniqueness, respecting the 20-char max when appending a numeric suffix
    // Example: baseSanitized = "john-doe", try john-doe, john-doe1, john-doe2, ...
    while (await this.userRepository.findByUsername(username)) {
      const suffix = String(counter++);
      const maxBaseLen = 20 - suffix.length; // ensure total length <= 20
      const truncatedBase = baseSanitized.slice(0, Math.max(1, maxBaseLen));
      username = `${truncatedBase}${suffix}`;
    }
    return username;
  }
}
