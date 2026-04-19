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
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AdminTutorialsDataTableService } from '@/tutorials/application/services/admin-tutorials-data-table.service';
import { AdminTutorialsListService } from '@/tutorials/application/services/admin-tutorials-list.service';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('admin/tutorials')
export class AdminTutorialsController {
  constructor(
    private readonly dataTableService: AdminTutorialsDataTableService,
    private readonly tutorialsListService: AdminTutorialsListService,
  ) {}

  // DataTable endpoint (admin)
  @Post('table')
  @CheckAbilities([Action.Read, 'Tutorial'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this.dataTableService.query(dto);
  }

  // Unpublish a single tutorial
  @Post(':id/unpublish')
  @CheckAbilities([Action.Update, 'Tutorial'])
  async unpublish(@Param('id') id: string) {
    await this.tutorialsListService.unpublish(id);
    return {};
  }

  // Bulk unpublish
  @Post('bulk-unpublish')
  @CheckAbilities([Action.Update, 'Tutorial'])
  async bulkUnpublish(@Body('ids') ids: string[]) {
    await this.tutorialsListService.bulkUnpublish(ids);
    return {};
  }

  // Bulk delete
  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'Tutorial'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this.tutorialsListService.bulkDelete(ids);
    return {};
  }

  // Delete single
  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'Tutorial'])
  async delete(@Param('id') id: string) {
    await this.tutorialsListService.delete(id);
    return {};
  }
}
