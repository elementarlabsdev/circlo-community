import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { SettingsService } from '@/settings/application/services/settings.service';
import {
  CommonPublicationListService
} from '@/publications/application/services/common-publication-list.service';
import { PoliciesGuard } from '@/identity/infrastructure/guards/policies.guard';
import { CheckPolicies } from '@/common/infrastructure/decorators/check-policies.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { Publication } from '@/publications/domain/entities/publication.entity';
import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@Controller('publications')
@UseGuards(FeatureEnabledGuard)
@FeatureEnabled('contentAllowPublications')
export class PublicationsController {
  constructor(
    private _publicationListService: CommonPublicationListService,
    private _settingsService: SettingsService,
  ) {}

  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability) => ability.can(Action.Read, 'Publication'))
  async index(
    @GetUser() user: any,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
    @Query('query') query = '',
  ) {
    const publicationsPerPage = +(await this._settingsService.findValueByName(
      'publicationsPerPage',
    ));
    return await this._publicationListService.getLatest(
      user,
      pageNumber,
      publicationsPerPage,
      {},
      query,
    );
  }
}
