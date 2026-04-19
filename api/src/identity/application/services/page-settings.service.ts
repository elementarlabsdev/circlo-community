import { Injectable } from '@nestjs/common';
import { GetLoginPageSettingsUseCase } from '@/identity/application/use-cases/get-login-page-settings.use-case';
import { GetRegisterPageSettingsUseCase } from '@/identity/application/use-cases/get-register-page-settings.use-case';

@Injectable()
export class PageSettingsService {
  constructor(
    private readonly getLoginPageSettingsUseCase: GetLoginPageSettingsUseCase,
    private readonly getRegisterPageSettingsUseCase: GetRegisterPageSettingsUseCase,
  ) {}

  getLoginPageSettings() {
    return this.getLoginPageSettingsUseCase.execute();
  }

  getRegisterPageSettings() {
    return this.getRegisterPageSettingsUseCase.execute();
  }
}
