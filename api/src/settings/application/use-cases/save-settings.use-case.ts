import { Inject, Injectable } from '@nestjs/common';
import {
  SETTING_REPOSITORY,
  SettingsRepositoryInterface,
} from '@/settings/domain/repositores/settings-repository.interface';

@Injectable()
export class SaveSettingsUseCase {
  constructor(
    @Inject(SETTING_REPOSITORY)
    private readonly repository: SettingsRepositoryInterface,
  ) {}

  execute(values: { [prop: string]: any }, category?: string): Promise<void> {
    return this.repository.save(values, category);
  }
}
