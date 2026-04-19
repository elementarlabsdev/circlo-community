import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { AdminPublicationListService } from '@/publications/application/services/admin-publication-list.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AdminPublicationsDataTableService } from '@/publications/application/services/admin-publications-data-table.service';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('admin/publications')
export class AdminPublicationsController {
  constructor(
    private readonly _publicationListService: AdminPublicationListService,
    private readonly _dataTable: AdminPublicationsDataTableService,
  ) {}

  // New DataTable-based endpoint
  @Post('table')
  @CheckAbilities([Action.Read, 'Publication'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this._dataTable.query(dto);
  }

  // Previously in AdminPublicationsUnpublishController
  @Post(':hash/unpublish')
  @CheckAbilities([Action.Update, 'Publication'])
  async unpublish(@Param('hash') hash: string) {
    await this._publicationListService.unpublish(hash);
    return {};
  }

  // Previously in AdminPublicationsBulkUnpublishController
  @Post('bulk-unpublish')
  @CheckAbilities([Action.Update, 'Publication'])
  async bulkUnpublish(@Body('hashes') hashes: string[]) {
    await this._publicationListService.bulkUnpublish(hashes);
    return {};
  }

  // Previously in AdminPublicationsBulkDeleteController
  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'Publication'])
  async bulkDelete(@Body('hashes') hashes: string[]) {
    await this._publicationListService.bulkDelete(hashes);
    return {};
  }

  // Previously in AdminPublicationsDeleteController
  @Delete(':hash/delete')
  @CheckAbilities([Action.Delete, 'Publication'])
  async delete(@Param('hash') hash: string) {
    await this._publicationListService.delete(hash);
    return {};
  }
}
