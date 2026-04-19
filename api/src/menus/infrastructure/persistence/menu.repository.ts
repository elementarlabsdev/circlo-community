import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MenuRepositoryInterface } from '@/menus/domain/repositories/menu-repository.interface';
import { MenuItem } from '@/menus/domain/entities/menu-item.entity';
import { Menu } from '@/menus/domain/entities/menu.entity';

@Injectable()
export class MenuRepository implements MenuRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Menu | null> {
    const menuFromDb = await this.prisma.menu.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!menuFromDb) return null;

    const menuItems = menuFromDb.items.map((item) =>
      MenuItem.reconstitute({ ...item, iconId: item.iconId ?? undefined }),
    );

    return Menu.reconstitute({ ...menuFromDb, items: menuItems });
  }

  async findByType(type: string): Promise<Menu | null> {
    const menuFromDb = await this.prisma.menu.findFirst({
      where: { type },
      include: { items: true },
    });

    if (!menuFromDb) return null;

    const menuItems = menuFromDb.items.map((item) =>
      MenuItem.reconstitute({ ...item, iconId: item.iconId ?? undefined }),
    );

    return Menu.reconstitute({ ...menuFromDb, items: menuItems });
  }

  async save(menu: Menu): Promise<void> {
    const data = menu.toPrimitives();

    await this.prisma.$transaction(async (tx) => {
      await tx.menu.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          name: data.name,
          type: data.type,
          position: data.position,
          items: {
            create: data.items,
          },
        },
        update: {
          name: data.name,
          position: data.position,
          items: {
            deleteMany: {
              menuId: data.id,
              id: { notIn: data.items.map((i) => i.id) },
            },
            upsert: data.items.map((item) => ({
              where: { id: item.id },
              create: item,
              update: item,
            })),
          },
        },
      });
    });
  }
}
