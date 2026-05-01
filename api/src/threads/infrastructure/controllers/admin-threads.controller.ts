import {
  Body,
  Controller,
  Delete,
  Param,
  UseGuards,
  Post,
  Get,
  HttpCode,
  Put,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { ThreadsService } from '@/threads/application/services/threads.service';
import { ThreadPrimitives } from '@/threads/domain/entities/thread.entity';

@Controller('admin/threads')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminThreadsController {
  constructor(
    private readonly _threadsTableService: DataTableService,
    private readonly _threadsService: ThreadsService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'Thread'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this._threadsTableService.query(dto);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'Thread'])
  async getOne(@Param('id') id: string) {
    const thread = await this._threadsService.findOneByIdWithRelations(id);
    return { thread: thread.toPrimitives() };
  }

  @Put(':id')
  @CheckAbilities([Action.Update, 'Thread'])
  async update(
    @Param('id') id: string,
    @Body() data: Partial<ThreadPrimitives>,
  ) {
    const thread = await this._threadsService.update(id, data);
    return { thread: thread.toPrimitives() };
  }

  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'Thread'])
  async delete(@Param('id') id: string) {
    await this._threadsService.deleteThread(id);
    return {};
  }
}
