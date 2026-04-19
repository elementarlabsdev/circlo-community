import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { ComplaintsService } from '@/complaints/application/services/complaints.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AdminComplaintsDataTableService } from '@/complaints/application/services/admin-complaints-data-table.service';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('platform/admin/complaints')
export class AdminComplaintsController {
  constructor(
    private readonly complaints: ComplaintsService,
    private readonly complaintsTable: AdminComplaintsDataTableService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'Complaint'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this.complaintsTable.query(dto);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'Complaint'])
  async byId(@Param('id') id: string) {
    const complaint = await this.complaints.adminFindById(id);
    return { complaint };
  }

  @Delete(':id')
  @CheckAbilities([Action.Delete, 'Complaint'])
  async delete(@Param('id') id: string) {
    await this.complaints.adminDelete(id);
    return { success: true };
  }
}
