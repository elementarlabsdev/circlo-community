import { Controller, Get } from '@nestjs/common';
import { MenusService } from '@/menus/application/services/menus.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';

@Controller('menus-for-sidebar')
export class MenuForSidebarController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  async sidebarMenus(@GetUser() user: any) {
    const isAdmin = user?.role?.type === 'admin';
    const main = await this.menusService.getMenuByType('sidebarMain', isAdmin);
    const footer = await this.menusService.getMenuByType('sidebarFooter', isAdmin);
    return {
      main,
      footer,
    };
  }
}
