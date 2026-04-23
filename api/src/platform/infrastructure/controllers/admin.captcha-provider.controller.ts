import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PlatformService } from '@/platform/application/services/platform.service';
import { UpdateCaptchaProviderDto } from '@/platform/application/dtos/update-captcha-provider.dto';
import { SetDefaultCaptchaProviderDto } from '@/platform/application/dtos/set-default-captcha-provider.dto';
import { ConfigService } from '@nestjs/config';

@Controller('admin/settings/captcha')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminCaptchaProviderController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('captcha');
    const captchaProviders =
      await this.platformService.getAllCaptchaProviders();
    return {
      settings,
      captchaProviders,
    };
  }

  @Get('admin-key')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async getAdminKey() {
    return {
      adminKey: this.configService.get<string>('CAP_ADMIN_KEY'),
    };
  }

  @Post('provider/update')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveProvider(@Body() dto: UpdateCaptchaProviderDto) {
    const { type, ...data } = dto;
    const provider = await this.platformService.updateCaptchaProvider(
      type,
      data,
    );
    return { provider };
  }

  @Post('provider/default')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async setDefault(@Body() dto: SetDefaultCaptchaProviderDto) {
    await this.platformService.setDefaultCaptchaProvider(dto.type);
    return { success: true };
  }
}
