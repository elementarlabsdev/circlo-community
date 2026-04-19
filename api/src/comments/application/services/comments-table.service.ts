import { Injectable } from '@nestjs/common';
import { CommentListService } from './comment-list.service';
import { TableColumn } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class CommentsTableService {
  private _defs = {
    id: {
      column: {
        name: 'Id',
        dataField: 'id',
        visible: false,
      },
    },
    content: {
      column: {
        name: 'Comment',
        dataField: 'content',
        visible: true,
        dataRenderer: 'comment',
      },
    },
    author: {
      column: {
        name: 'Author',
        dataField: 'author',
        dataRenderer: 'author',
        visible: true,
      },
    },
    inResponseTo: {
      column: {
        name: 'In response to',
        dataField: 'publication',
        dataRenderer: 'inResponseTo',
        visible: true,
      },
    },
    createdAt: {
      column: {
        name: 'Submitted At',
        dataField: 'createdAt',
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

  constructor(private _commentListService: CommentListService) {}

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
      ...(await this._commentListService.findPaginated(
        pageSize,
        pageNumber,
        search,
        this.getOrderBy(sortState),
      )),
    };
  }
}
