import { Injectable } from '@nestjs/common';
import { PageListService } from './page-list.service';
import { User } from '@prisma/client';
import { TableColumn } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class PagesTableService {
  private _defs = {
    id: {
      column: {
        name: 'Id',
        dataField: 'id',
        visible: false,
      },
    },
    title: {
      column: {
        name: 'Name',
        dataField: 'title',
        dataRenderer: 'title',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          name: direction,
        };
      },
    },
    createdAt: {
      column: {
        name: 'Published At',
        dataField: 'publishedAt',
        dataRenderer: 'date',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          createdAt: direction,
        };
      },
    },
  };

  constructor(private _pageListService: PageListService) {}

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

  async getPayload(
    pageSize: number,
    pageNumber: number,
    statusType: string,
    author: User,
    search = '',
    sortState = null,
  ) {
    return {
      columns: this.getColumns(),
      ...(await this._pageListService.findPaginated(
        pageSize,
        pageNumber,
        statusType,
        author,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
