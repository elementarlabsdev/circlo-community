import { Controller, Get } from '@nestjs/common';
import { PageSettingsService } from '@/identity/application/services/page-settings.service';

@Controller('identity/page-settings')
export class PageSettingsController {
  constructor(private readonly pageSettingsService: PageSettingsService) {}

  @Get('login')
  async getLoginSettings() {
    return this.pageSettingsService.getLoginPageSettings();
  }

  @Get('register')
  async getRegisterSettings() {
    return this.pageSettingsService.getRegisterPageSettings();
  }
}
