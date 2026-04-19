import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { ConfigService } from '@nestjs/config';

@Controller('admin/settings/oauth-providers')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminOAuthProviderController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const hostUrl = this.configService.get('HOST_URL');
    const oAuthProviders = await this.platformService.getAllOAuthProviders();
    return { oAuthProviders, hostUrl };
  }

  @Post('provider/update')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveProvider(
    @Body() dto: { type: string; isEnabled?: boolean; config?: any },
  ) {
    const updated = await this.platformService.updateOAuthProvider(dto.type, {
      isEnabled: dto.isEnabled,
      config: dto.config ?? dto,
    });
    return { provider: updated };
  }

  @Post('reorder')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async reorder(
    @Body()
    body: {
      items: { id: string; position: number }[];
    },
  ) {
    const items = Array.isArray(body?.items) ? body.items : [];
    const updated = await this.platformService.reorderOAuthProviders(items);
    return { updated };
  }
}
