import { Inject, Injectable } from '@nestjs/common';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class GetSettingUseCase {
  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly repository: SettingsRepositoryInterface,
  ) {}

  execute(name: string) {
    return this.repository.findOneByName(name);
  }
}
