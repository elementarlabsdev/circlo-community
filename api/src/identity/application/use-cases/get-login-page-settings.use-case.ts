import { Inject, Injectable } from '@nestjs/common';
import { LoginPageSettingsDto } from '../dtos/page-settings.dto';
import {
  OAUTH_PROVIDER_REPOSITORY,
  OAuthProviderRepositoryInterface,
} from '@/identity/domain/repositories/oauth-provider.repository.interface';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class GetLoginPageSettingsUseCase {
  constructor(
    @Inject(OAUTH_PROVIDER_REPOSITORY)
    private readonly providerRepository: OAuthProviderRepositoryInterface,
    @Inject(SETTING_REPOSITORY)
    private readonly settingsRepository: SettingsRepositoryInterface,
  ) {}

  async execute(): Promise<LoginPageSettingsDto> {
    const registrationEnabled = await this.settingsRepository.findValueByName(
      'registrationEnabled',
    );
    const oAuthEnabled =
      await this.settingsRepository.findValueByName('oAuthEnabled');
    const monetizationPaidAccountEnabledRaw =
      await this.settingsRepository.findValueByName(
        'monetizationPaidAccountEnabled',
        false,
      );
    const monetizationPaidAccountEnabled =
      monetizationPaidAccountEnabledRaw === 'true' ||
      monetizationPaidAccountEnabledRaw === true;

    let oAuthProviders = [];

    if (oAuthEnabled) {
      oAuthProviders = await this.providerRepository.findAllActive();
    }

    return {
      registrationEnabled,
      oAuthEnabled,
      monetizationPaidAccountEnabled,
      oAuthProviders,
    };
  }
}
