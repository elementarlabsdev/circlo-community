import { Inject, Injectable, ConflictException } from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { EventBus } from '@nestjs/cqrs';
import { ConfigService } from '@nestjs/config';
import {
  USER_REPOSITORY,
  UserRepositoryInterface,
} from '@/identity/domain/repositories/user-repository.interface';
import { AdminCreateUserDto } from '@/identity/application/dtos/admin-create-user.dto';
import { User } from '@/identity/domain/entities/user.entity';
import { UserAccountStatus } from '@/identity/domain/value-objects/user-account-status.vo';
import {
  COOKIE_SETTINGS_REPOSITORY,
  CookieSettingsRepositoryInterface,
} from '@/identity/domain/repositories/cookie-settings-repository.interface';
import { adminCreatedUserEmail } from '@/identity/application/templates/admin-created-user.email';
import { EmailSendEvent } from '@/mail/domain/events/email-send.event';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class AdminCreateUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepositoryInterface,
    @Inject(COOKIE_SETTINGS_REPOSITORY)
    private readonly cookieSettingsRepository: CookieSettingsRepositoryInterface,
    private readonly i18n: I18nService,
    private readonly eventBus: EventBus,
    private readonly configService: ConfigService,
    private readonly settingsService: SettingsService,
  ) {}

  async execute(dto: AdminCreateUserDto): Promise<{ id: string }> {
    if (await this.userRepository.findByEmail(dto.email)) {
      throw new ConflictException(
        await this.i18n.t('errors.email_already_exists'),
      );
    }

    if (await this.userRepository.findByUsername(dto.username)) {
      throw new ConflictException(
        await this.i18n.t('errors.username_already_in_use'),
      );
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(dto.password, salt);
    const user = User.create({
      id: uuidv4(),
      email: dto.email,
      passwordHash,
      roleId: dto.roleId,
      profile: {
        name: dto.name,
        username: dto.username,
        preferredColorScheme: 'light',
      },
      registrationProvider: 'email',
      accountStatus: UserAccountStatus.create({
        verified: dto.verified ?? false,
      }),
    });

    await this.userRepository.save(user);
    await this.cookieSettingsRepository.createDefaultForUser(user.id);

    if (dto.sendEmail) {
      const loginUrl = `${this.configService.get('FRONTEND_URL')}/login`;
      const lang = this.configService.get('LOCALE');
      const communityName =
        await this.settingsService.findValueByName('siteTitle');
      const logoUrl = await this.settingsService.findValueByName('siteLogoUrl');
      const translations = {
        subject: await this.i18n.t('common.emails.admin_created_user.subject', {
          lang,
        }),
        hello: await this.i18n.t('common.emails.admin_created_user.hello', {
          args: { name: dto.name },
          lang,
        }),
        text: await this.i18n.t('common.emails.admin_created_user.text', {
          lang,
        }),
        email: await this.i18n.t('common.emails.admin_created_user.email', {
          lang,
        }),
        password: await this.i18n.t(
          'common.emails.admin_created_user.password',
          {
            lang,
          },
        ),
        login_button: await this.i18n.t(
          'common.emails.admin_created_user.login_button',
          { lang },
        ),
        password_notice: await this.i18n.t(
          'common.emails.admin_created_user.password_notice',
          { lang },
        ),
        footerText: await this.i18n.t('common.emails.all_rights_reserved', {
          lang,
        }),
      };

      this.eventBus.publish(
        new EmailSendEvent(
          dto.email,
          await adminCreatedUserEmail(
            dto.name,
            dto.email,
            dto.password,
            loginUrl,
            communityName,
            logoUrl,
            translations,
          ),
        ),
      );
    }

    return { id: user.id };
  }
}
