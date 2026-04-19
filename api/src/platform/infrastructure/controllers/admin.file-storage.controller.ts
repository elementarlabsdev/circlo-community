import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';
import { PlatformService } from '@/platform/application/services/platform.service';
import { AwsFileStorageProviderDto } from '@/platform/application/dtos/aws-file-storage-provider.dto';
import { DigitaloceanFileStorageProviderDto } from '@/platform/application/dtos/digitalocean-file-storage-provider.dto';
import { HetznerFileStorageProviderDto } from '@/platform/application/dtos/hetzner-file-storage-provider.dto';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Controller('admin/settings/file-storage')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminFileStorageController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly platformService: PlatformService,
    private readonly prisma: PrismaService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const fileStorageSettings =
      await this.settingsService.findAllFlatten('fileStorage');
    const uploadSettings = await this.settingsService.findAllFlatten('upload');
    const settings = { ...fileStorageSettings, ...uploadSettings };
    const fileStorageProviders =
      await this.platformService.getAllFileStorageProviders();
    return {
      settings,
      fileStorageProviders,
    };
  }

  @Post('settings')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveSettings(@Body() dto: { [key: string]: any }) {
    await this.settingsService.save(dto, 'upload');
    return { success: true };
  }

  @Post('provider/aws-s3')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveAwsProvider(@Body() dto: AwsFileStorageProviderDto) {
    const provider = await this.platformService.updateFileStorageProvider(
      'aws-s3',
      dto,
    );
    return { provider };
  }

  @Post('provider/digitalocean')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveDigitaloceanProvider(
    @Body() dto: DigitaloceanFileStorageProviderDto,
  ) {
    const provider = await this.platformService.updateFileStorageProvider(
      'digitalocean',
      dto as any,
    );
    return { provider };
  }

  @Post('provider/hetzner')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveHetznerProvider(@Body() dto: HetznerFileStorageProviderDto) {
    const provider = await this.platformService.updateFileStorageProvider(
      'hetzner',
      dto as any,
    );
    return { provider };
  }

  @Post('provider/set-default')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async setDefaultProvider(@Body() dto: { type: string }) {
    await this.prisma.fileStorageProvider.updateMany({
      data: { isDefault: false },
    });
    await this.prisma.fileStorageProvider.update({
      where: { type: dto.type },
      data: { isDefault: true },
    });
    return {};
  }
}
