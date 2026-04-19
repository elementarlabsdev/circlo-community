import { Injectable } from '@nestjs/common';
import { Menu } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MenuDto } from '@/menus/application/dtos/menu.dto';

@Injectable()
export class MenuListService {
  constructor(private _prisma: PrismaService) {}

  async createNew(): Promise<Menu> {
    const name = 'Menu ' + crypto.randomUUID().split('-')[0];
    return this._prisma.menu.create({
      data: {
        name,
        type: crypto.randomUUID(),
      },
    });
  }

  async findOneById(id: string): Promise<Menu> {
    return this._prisma.menu.findUnique({
      where: {
        id,
      },
    });
  }

  async findOneByIdWithItems(id: string): Promise<Menu> {
    return this._prisma.menu.findUnique({
      where: {
        id,
      },
      include: {
        items: {
          orderBy: {
            position: 'asc',
          },
        },
      },
    });
  }

  async save(id: string, menuDto: MenuDto): Promise<Menu> {
    const actualMenuItemIds = menuDto.items.map((item) => item.id);
    const menu = await this._prisma.menu.update({
      where: {
        id,
      },
      data: {
        name: menuDto.name,
        items: {
          upsert: menuDto.items.map((item) => {
            return {
              where: {
                id: item.id,
              },
              update: {
                ...item,
                updatedAt: new Date(),
              },
              create: {
                ...item,
                createdAt: new Date(),
              },
            };
          }),
        },
      },
    });
    await this._prisma.menuItem.deleteMany({
      where: {
        id: {
          notIn: actualMenuItemIds,
        },
        menuId: id,
      },
    });
    return menu;
  }

  async findPaginated(
    pageSize: number,
    pageNumber: number,
    searchQuery = '',
    sortState = null,
  ) {
    const where = {};
    let orderBy: any = {
      position: 'asc',
    };

    if (searchQuery) {
      where['title'] = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Menu[] = await this._prisma.menu.findMany({
      where: {
        ...where,
      },
      orderBy: {
        ...orderBy,
      },
      include: {},
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.menu.count();
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    return {
      items,
      pagination,
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async delete(id: string): Promise<void> {
    await this._prisma.menu.delete({
      where: {
        id,
      },
    });
  }
}
