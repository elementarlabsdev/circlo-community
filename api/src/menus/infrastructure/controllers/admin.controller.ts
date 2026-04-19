import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Post,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { CreateMenuDto } from '@/menus/application/dtos/create-menu.dto';
import { MenusService } from '@/menus/application/services/menus.service';
import { AddMenuItemDto } from '@/menus/application/dtos/add-menu-item.dto';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { SaveMenuDto } from '@/menus/application/dtos/save-menu.dto';

@Controller('admin/menus')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminController {
  constructor(
    private menusService: MenusService,
    private readonly _menusTableService: DataTableService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this._menusTableService.query(dto);
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async getMenuById(@Param('id') id: string) {
    return this.menusService.getMenuById(id);
  }

  @Post()
  @CheckAbilities([Action.Create, 'AdminPanel'])
  async createMenu(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.createMenu(createMenuDto);
  }

  @Post(':id/items')
  @CheckAbilities([Action.Update, 'AdminPanel'])
  async addItemToMenu(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addMenuItemDto: AddMenuItemDto,
  ) {
    await this.menusService.addItemToMenu(id, addMenuItemDto);
  }

  @Post(':id')
  @CheckAbilities([Action.Update, 'AdminPanel'])
  async saveMenu(@Param('id') id: string, @Body() dto: SaveMenuDto) {
    await this.menusService.save(id, dto);
    return {};
  }

  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'AdminPanel'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this.menusService.bulkDelete(ids);
    return {};
  }

  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'AdminPanel'])
  async delete(@Param('id') id: string) {
    await this.menusService.delete(id);
    return {};
  }
}
