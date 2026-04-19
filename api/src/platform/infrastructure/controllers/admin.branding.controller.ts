import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { PlatformService } from '@/platform/application/services/platform.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { SettingsService } from '@/settings/application/services/settings.service';
import { BrandingSettingsDto } from '@/platform/application/dtos/branding-settings.dto';

@Controller('admin/settings/branding')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminBrandingController {
  constructor(
    private readonly platformService: PlatformService,
    private readonly settingsService: SettingsService,
  ) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('branding');
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: BrandingSettingsDto) {
    await this.settingsService.save(dto, 'branding');
    return {};
  }

  @Post('logo/upload')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  @UseInterceptors(FileInterceptor('image'))
  async logoUpload(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this.platformService.uploadGeneralImage(
      uploadedFile,
      req.user,
    );
    return { url: file.url };
  }

  @Post('favicon/upload')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  @UseInterceptors(FileInterceptor('image'))
  async faviconUpload(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this.platformService.uploadGeneralImage(
      uploadedFile,
      req.user,
    );
    return { url: file.url };
  }
}
