import { Inject, Injectable } from '@nestjs/common';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class ListSettingsUseCase {
  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly repository: SettingsRepositoryInterface,
  ) {}

  execute(category: string = '') {
    return this.repository.findAll(category);
  }
}
