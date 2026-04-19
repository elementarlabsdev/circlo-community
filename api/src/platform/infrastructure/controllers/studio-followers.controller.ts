import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { StudioFollowersDataTableService } from '@/platform/application/services/datatable/studio-followers-data-table.service';

@UseGuards(AuthGuard)
@Controller()
export class StudioFollowersController {
  constructor(
    private readonly dataTable: StudioFollowersDataTableService,
  ) {}

  @Post('studio/followers/table')
  async table(@GetUser() user: User, @Body() dto: DataTableQueryDto) {
    return await this.dataTable.queryCustom(dto, user.id);
  }
}
