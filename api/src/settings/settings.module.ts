import { Module, Global } from '@nestjs/common';
import { CustomizationEditController } from '@/settings/infrastructure/controllers/admin/customization/customization-edit.controller';
import { SettingsService } from '@/settings/application/services/settings.service';
import { SettingRepository } from '@/settings/infrastructure/persistence/settings.repository';
import { SETTING_REPOSITORY } from '@/settings/domain/repositores/settings-repository.interface';
import { HasSettingUseCase } from '@/settings/application/use-cases/has-setting.use-case';
import { CreateSettingUseCase } from '@/settings/application/use-cases/create-setting.use-case';
import { ListSettingsUseCase } from '@/settings/application/use-cases/list-settings.use-case';
import { GetSettingUseCase } from '@/settings/application/use-cases/get-setting.use-case';
import { GetSettingValueUseCase } from '@/settings/application/use-cases/get-setting-value.use-case';
import { GetSettingsFlattenUseCase } from '@/settings/application/use-cases/get-settings-flatten.use-case';
import { SaveSettingsUseCase } from '@/settings/application/use-cases/save-settings.use-case';

@Global()
@Module({
  imports: [],
  controllers: [CustomizationEditController],
  providers: [
    // use-cases
    HasSettingUseCase,
    CreateSettingUseCase,
    ListSettingsUseCase,
    GetSettingUseCase,
    GetSettingValueUseCase,
    GetSettingsFlattenUseCase,
    SaveSettingsUseCase,

    // services
    SettingsService,

    // repositories
    SettingRepository,
    {
      provide: SETTING_REPOSITORY,
      useClass: SettingRepository,
    },
  ],
  exports: [SettingsService, SETTING_REPOSITORY],
})
export class SettingsModule {}
