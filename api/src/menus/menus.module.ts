import { Global, Module } from '@nestjs/common';
import { MENU_REPOSITORY } from '@/menus/domain/repositories/menu-repository.interface';
import { MenusService } from '@/menus/application/services/menus.service';
import { MenuRepository } from '@/menus/infrastructure/persistence/menu.repository';
import { AdminController } from '@/menus/infrastructure/controllers/admin.controller';
import { CreateMenuUseCase } from '@/menus/application/use-cases/create-menu.use-case';
import { AddItemToMenuUseCase } from '@/menus/application/use-cases/add-item-to-menu.use-case';
import { GetMenuByIdUseCase } from '@/menus/application/use-cases/get-menu-by-id.use-case';
import { MenuForSidebarController } from '@/menus/infrastructure/controllers/menu-for-sidebar.controller';
import { GetMenuByTypeUseCase } from '@/menus/application/use-cases/get-menu-by-type.use-case';
import { MenusDataTableService } from '@/menus/application/services/menus-data-table.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';

@Global()
@Module({
  imports: [],
  controllers: [AdminController, MenuForSidebarController],
  providers: [
    {
      provide: MENU_REPOSITORY,
      useClass: MenuRepository,
    },
    CreateMenuUseCase,
    AddItemToMenuUseCase,
    GetMenuByIdUseCase,
    GetMenuByTypeUseCase,
    MenusService,
    MenusDataTableService,
    { provide: DataTableService, useClass: MenusDataTableService },
  ],
  exports: [MenusService],
})
export class MenusModule {}
