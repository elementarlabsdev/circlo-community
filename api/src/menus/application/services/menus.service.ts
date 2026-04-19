import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AddMenuItemDto } from '@/menus/application/dtos/add-menu-item.dto';
import { CreateMenuDto } from '@/menus/application/dtos/create-menu.dto';
import { AddItemToMenuUseCase } from '@/menus/application/use-cases/add-item-to-menu.use-case';
import { CreateMenuUseCase } from '@/menus/application/use-cases/create-menu.use-case';
import { GetMenuByIdUseCase } from '@/menus/application/use-cases/get-menu-by-id.use-case';
import { GetMenuByTypeUseCase } from '@/menus/application/use-cases/get-menu-by-type.use-case';
import { MenuViewModel } from '@/menus/domain/menus.model';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  MENU_REPOSITORY,
  MenuRepositoryInterface,
} from '@/menus/domain/repositories/menu-repository.interface';
import { SaveMenuDto } from '@/menus/application/dtos/save-menu.dto';

@Injectable()
export class MenusService {
  constructor(
    private readonly createMenuUseCase: CreateMenuUseCase,
    private readonly addItemToMenuUseCase: AddItemToMenuUseCase,
    private readonly getMenuByIdUseCase: GetMenuByIdUseCase,
    private readonly getMenuByTypeUseCase: GetMenuByTypeUseCase,
    private readonly prisma: PrismaService,
    @Inject(MENU_REPOSITORY)
    private readonly menuRepository: MenuRepositoryInterface,
  ) {}

  createMenu(dto: CreateMenuDto): Promise<{ id: string }> {
    return this.createMenuUseCase.execute(dto);
  }

  addItemToMenu(menuId: string, dto: AddMenuItemDto): Promise<void> {
    return this.addItemToMenuUseCase.execute(menuId, dto);
  }

  async getMenuById(id: string): Promise<MenuViewModel> {
    return this.getMenuByIdUseCase.execute(id);
  }

  getMenuByType(type: string, isAdmin = false): Promise<MenuViewModel> {
    return this.getMenuByTypeUseCase.execute(type, isAdmin);
  }

  async delete(id: string): Promise<void> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      select: { id: true, isPermanent: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');
    if (menu.isPermanent) {
      throw new ForbiddenException('Permanent menu cannot be deleted');
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({ where: { menuId: id } });
      await tx.menu.delete({ where: { id } });
    });
  }

  async bulkDelete(ids: string[]): Promise<void> {
    if (!ids || ids.length === 0) return;
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: ids } },
      select: { id: true, isPermanent: true },
    });
    const permanent = menus.filter((m) => m.isPermanent).map((m) => m.id);
    if (permanent.length > 0) {
      throw new ForbiddenException(
        'Some menus are permanent and cannot be deleted',
      );
    }
    await this.prisma.$transaction(async (tx) => {
      await tx.menuItem.deleteMany({ where: { menuId: { in: ids } } });
      await tx.menu.deleteMany({ where: { id: { in: ids } } });
    });
  }

  async save(id: string, dto: SaveMenuDto): Promise<void> {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      select: { id: true },
    });
    if (!menu) throw new NotFoundException('Menu not found');

    const withId = (dto.items || []).filter((i) => !!i.id);
    const withoutId = (dto.items || []).filter((i) => !i.id);

    await this.prisma.menu.update({
      where: { id },
      data: {
        name: dto.name,
        items: {
          deleteMany: {
            menuId: id,
            id: { notIn: withId.map((i) => String(i.id)) },
          },
          upsert: withId.map((item) => ({
            where: { id: String(item.id) },
            update: {
              name: item.name,
              url: item.url,
              position: item.position,
              authorisedOnly: item.authorisedOnly,
              iconUrl: item.iconUrl ?? null,
            },
            create: {
              id: String(item.id),
              name: item.name,
              url: item.url,
              position: item.position,
              authorisedOnly: item.authorisedOnly,
              iconUrl: item.iconUrl ?? null,
            },
          })),
          create: withoutId.map((item) => ({
            name: item.name,
            url: item.url,
            position: item.position,
            authorisedOnly: item.authorisedOnly,
            iconUrl: item.iconUrl ?? null,
          })),
        },
      },
    });
  }
}
