import { Injectable } from '@nestjs/common';
import { TableColumn } from '@/common/domain/interfaces/interfaces';
import { AdminChannelListService } from '@/channels/application/services/admin-channel-list.service';

@Injectable()
export class ChannelsTableService {
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
    followersCount: {
      column: {
        name: 'Followers',
        dataField: 'followersCount',
        dataRenderer: 'number',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          followersCount: direction,
        };
      },
    },
    publicationsCount: {
      column: {
        name: 'Publications',
        dataField: 'publicationsCount',
        dataRenderer: 'number',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          publicationsCount: direction,
        };
      },
    },
  };

  constructor(private _channelListService: AdminChannelListService) {}

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
      ...(await this._channelListService.findPaginated(
        pageSize,
        pageNumber,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
