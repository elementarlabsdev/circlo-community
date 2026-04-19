import { Inject, Injectable } from '@nestjs/common';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class GetSettingValueUseCase {
  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly repository: SettingsRepositoryInterface,
  ) {}

  execute<T = any>(name: string, defaultValue: any = null): Promise<T | any> {
    return this.repository.findValueByName<T>(name, defaultValue);
  }
}
