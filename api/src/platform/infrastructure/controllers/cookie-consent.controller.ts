import { Controller, Get } from '@nestjs/common';
import { PlatformService } from '@/platform/application/services/platform.service';

@Controller('cookie-consent')
export class CookieConsentController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  async index() {
    const settings = await this.platformService.getCookieConsentSettings();
    return { settings };
  }
}
