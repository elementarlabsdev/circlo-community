import {
  Body,
  Controller,
  Delete,
  Param,
  UseGuards,
  Post,
  Get,
  Put,
  HttpCode,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { CommentDto } from '@/comments/application/dto/comment.dto';
import { CommentListService } from '@/comments/application/services/comment-list.service';

@Controller('admin/comments')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminCommentsController {
  constructor(
    private readonly _commentsTableService: DataTableService,
    private _commentListService: CommentListService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'Comment'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this._commentsTableService.query(dto);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'Comment'])
  async getOne(@Param('id') id: string) {
    const comment = await this._commentListService.findOneById(id);
    return { comment };
  }

  @Put(':id')
  @CheckAbilities([Action.Update, 'Comment'])
  async update(@Param('id') id: string, @Body() dto: CommentDto) {
    await this._commentListService.update(id, dto);
    return {};
  }

  @Put(':id/hide')
  @HttpCode(200)
  @CheckAbilities([Action.Update, 'Comment'])
  async hide(@Param('id') id: string) {
    await this._commentListService.hide(id);
    return {};
  }

  @Put(':id/unhide')
  @HttpCode(200)
  @CheckAbilities([Action.Update, 'Comment'])
  async unhide(@Param('id') id: string) {
    await this._commentListService.unhide(id);
    return {};
  }

  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'Comment'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this._commentListService.bulkDelete(ids);
    return {};
  }

  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'Comment'])
  async delete(@Param('id') id: string) {
    await this._commentListService.delete(id);
    return {};
  }
}
