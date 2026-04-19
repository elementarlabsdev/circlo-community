import { Injectable } from '@nestjs/common';
import { AdminPublicationListService } from '@/publications/application/services/admin-publication-list.service';
import { TableColumn } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class AdminPublicationsTableService {
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
        name: 'Title',
        dataField: 'title',
        dataRenderer: 'title',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          title: direction,
        };
      },
    },
    channel: {
      column: {
        name: 'Channel',
        dataField: 'channel',
        dataRenderer: 'channel',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          channel: {
            name: direction,
          },
        };
      },
    },
    author: {
      column: {
        name: 'Author',
        dataField: 'author',
        dataRenderer: 'author',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          author: {
            name: direction,
          },
        };
      },
    },
    publishedAt: {
      column: {
        name: 'Published At',
        dataField: 'publishedAt',
        dataRenderer: 'date',
        visible: true,
      },
      orderBy: (direction: 'asc' | 'desc') => {
        return {
          publishedAt: direction,
        };
      },
    },
  };

  constructor(private _publicationListService: AdminPublicationListService) {}

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
      ...(await this._publicationListService.findPaginatedPublished(
        pageSize,
        pageNumber,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
