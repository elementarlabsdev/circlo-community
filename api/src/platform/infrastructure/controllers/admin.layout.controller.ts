import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { LayoutsService } from '@/platform/application/services/layouts.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { LayoutsDataTableService } from '@/platform/application/services/datatable/layouts-data-table.service';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('admin/layout')
export class AdminLayoutController {
  constructor(
    private readonly layouts: LayoutsService,
    private readonly layoutsTable: LayoutsDataTableService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async list(@Body() dto: DataTableQueryDto) {
    return this.layoutsTable.query(dto);
  }

  @Get(':id/edit')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async edit(@Param('id') id: string) {
    return this.layouts.getEditPayload(id);
  }

  @Post(':layoutSlotId/save')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async save(
    @Param('layoutSlotId') layoutSlotId: string,
    @Body('widgets') widgets: any[],
  ) {
    return this.layouts.saveLayoutWidgets(layoutSlotId, widgets);
  }
}
