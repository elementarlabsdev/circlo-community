import { Injectable } from '@nestjs/common';
import { HasSettingUseCase } from '@/settings/application/use-cases/has-setting.use-case';
import { CreateSettingUseCase } from '@/settings/application/use-cases/create-setting.use-case';
import { ListSettingsUseCase } from '@/settings/application/use-cases/list-settings.use-case';
import { GetSettingUseCase } from '@/settings/application/use-cases/get-setting.use-case';
import { GetSettingValueUseCase } from '@/settings/application/use-cases/get-setting-value.use-case';
import { GetSettingsFlattenUseCase } from '@/settings/application/use-cases/get-settings-flatten.use-case';
import { SaveSettingsUseCase } from '@/settings/application/use-cases/save-settings.use-case';

@Injectable()
export class SettingsService {
  constructor(
    private readonly hasSettingUseCase: HasSettingUseCase,
    private readonly createSettingUseCase: CreateSettingUseCase,
    private readonly listSettingsUseCase: ListSettingsUseCase,
    private readonly getSettingUseCase: GetSettingUseCase,
    private readonly getSettingValueUseCase: GetSettingValueUseCase,
    private readonly getSettingsFlattenUseCase: GetSettingsFlattenUseCase,
    private readonly saveSettingsUseCase: SaveSettingsUseCase,
  ) {}

  async has(name: string): Promise<boolean> {
    return this.hasSettingUseCase.execute(name);
  }

  async create(name: string, category: string, value: any) {
    return this.createSettingUseCase.execute(name, category, value);
  }

  async findAll(category: string = '') {
    return this.listSettingsUseCase.execute(category);
  }

  async findOneByName(name: string) {
    return this.getSettingUseCase.execute(name);
  }

  async findValueByName(name: string, defaultValue = null) {
    return this.getSettingValueUseCase.execute(name, defaultValue);
  }

  async findAllFlatten(category: string = '') {
    return this.getSettingsFlattenUseCase.execute(category);
  }

  async save(values: { [prop: string]: any }, category?: string) {
    return this.saveSettingsUseCase.execute(values, category);
  }
}
