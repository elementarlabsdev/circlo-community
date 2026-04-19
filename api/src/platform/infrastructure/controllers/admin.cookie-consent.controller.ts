import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { CookieConsentDto } from '@/platform/application/dtos/cookie-consent.dto';

@Controller('admin/settings/cookie-consent')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminCookieConsentController {
  constructor(private readonly platformService: PlatformService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.platformService.getCookieConsentSettings();
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: CookieConsentDto) {
    await this.platformService.saveCookieConsentSettings(dto);
    return {};
  }
}
