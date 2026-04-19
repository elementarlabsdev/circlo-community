import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { SettingsService } from '@/settings/application/services/settings.service';

@Controller('admin/settings/mail')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminMailController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    const settings = await this.settingsService.findAllFlatten('mail');
    return { settings };
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: any) {
    const mailKeys = ['mailDomain', 'mailFrom', 'systemEmail', 'supportEmail'];
    const mailPayload: Record<string, any> = {};

    for (const key of mailKeys) {
      if (dto[key] !== undefined) mailPayload[key] = dto[key];
    }

    if (Object.keys(mailPayload).length) {
      await this.settingsService.save(mailPayload, 'mail');
    }

    return {};
  }
}
