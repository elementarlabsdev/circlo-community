import { Injectable } from '@nestjs/common';
import { Layout } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { TableColumn } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class LayoutListService {
  private _defs = {
    id: {
      column: {
        name: 'Id',
        dataField: 'id',
        visible: false,
      },
    },
    name: {
      column: {
        name: 'Name',
        dataField: 'name',
        dataRenderer: 'name',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          name: direction,
        };
      },
    },
  };

  constructor(private _prisma: PrismaService) {}

  getLayoutById(id: string): Promise<Layout> {
    return this._prisma.layout.findUniqueOrThrow({
      where: {
        id,
      },
      include: {
        layoutSlots: {
          include: {
            layoutWidgets: {
              orderBy: {
                position: 'asc',
              },
            },
          },
        },
      },
    });
  }

  getColumns(): TableColumn[] {
    const columns = [];
    Object.keys(this._defs).forEach((defName) => {
      columns.push(this._defs[defName].column);
    });
    return columns;
  }

  getOrderBy(sortState = null) {
    if (!sortState || !['asc', 'desc'].includes(sortState.direction)) {
      return null;
    }

    if (
      !this._defs[sortState.active] ||
      !this._defs[sortState.active].orderBy
    ) {
      return null;
    }

    return this._defs[sortState.active].orderBy(sortState.direction);
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

    const items: Layout[] = await this._prisma.layout.findMany({
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
    const totalItems = await this._prisma.layout.count({});
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

  async getPayload(
    pageSize: number,
    pageNumber: number,
    search = '',
    sortState = null,
  ) {
    return {
      columns: this.getColumns(),
      ...(await this.findPaginated(
        pageSize,
        pageNumber,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
