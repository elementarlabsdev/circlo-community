import { Inject, Injectable } from '@nestjs/common';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class GetSettingsFlattenUseCase {
  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly repository: SettingsRepositoryInterface,
  ) {}

  execute(category: string = ''): Promise<Record<string, any>> {
    return this.repository.findAllFlatten(category);
  }
}
