import { Injectable } from '@nestjs/common';
import { MenuListService } from './menu-list.service';
import { TableColumn } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class MenusTableService {
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

  constructor(private _menuListService: MenuListService) {}

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
    search = '',
    sortState = null,
  ) {
    return {
      columns: this.getColumns(),
      ...(await this._menuListService.findPaginated(
        pageSize,
        pageNumber,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
