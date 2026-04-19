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
import { MetaTagService } from '@/platform/application/services/meta-tag.service';

@Controller('admin/settings/meta-tags')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminMetaTagsController {
  constructor(private readonly metaTagService: MetaTagService) {}

  @Get()
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async index() {
    return this.metaTagService.findAllGlobal();
  }

  @Post()
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(@Body() dto: { metaTags: any[] }) {
    return this.metaTagService.saveGlobal(dto.metaTags || []);
  }
}
