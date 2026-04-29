import { Inject, Injectable } from '@nestjs/common';
import { RegisterPageSettingsDto } from '../dtos/page-settings.dto';
import {
  OAUTH_PROVIDER_REPOSITORY,
  OAuthProviderRepositoryInterface,
} from '@/identity/domain/repositories/oauth-provider.repository.interface';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';
import {
  CAPTCHA_PROVIDER_REPOSITORY,
  CaptchaProviderRepositoryInterface,
} from '@/platform/domain/repositories/captcha-provider.repository.interface';

@Injectable()
export class GetRegisterPageSettingsUseCase {
  constructor(
    @Inject(OAUTH_PROVIDER_REPOSITORY)
    private readonly providerRepository: OAuthProviderRepositoryInterface,
    @Inject(SETTING_REPOSITORY)
    private readonly settingsRepository: SettingsRepositoryInterface,
    @Inject(CAPTCHA_PROVIDER_REPOSITORY)
    private readonly captchaProviderRepository: CaptchaProviderRepositoryInterface,
  ) {}

  async execute(): Promise<RegisterPageSettingsDto> {
    const registrationEnabled = await this.settingsRepository.findValueByName(
      'registrationEnabled',
    );
    const oAuthEnabled =
      await this.settingsRepository.findValueByName('oAuthEnabled');
    let oAuthProviders = [];

    if (oAuthEnabled) {
      oAuthProviders = await this.providerRepository.findAllActive();
    }

    const captchaProviders = await this.captchaProviderRepository.findAll();
    const defaultCaptcha = captchaProviders.find(
      (p) => p.isDefault && p.isConfigured,
    );

    return {
      registrationEnabled,
      oAuthEnabled,
      oAuthProviders,
      captcha: defaultCaptcha
        ? {
            type: defaultCaptcha.type,
            siteKey: defaultCaptcha.siteKey ?? undefined,
          }
        : undefined,
    };
  }
}
