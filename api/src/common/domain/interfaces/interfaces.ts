import { Request as ExpressRequest } from 'express';
import { User, LayoutWidgetDef } from '@prisma/client';

export interface Request extends ExpressRequest {
  user?: User;
}

export interface BookmarkAwareInterface {
  id: string;
  getBookmarkType: () => string;
}

export interface WidgetAwareService {
  getData(widget: LayoutWidgetDef): any;
}

export interface TableColumn {
  name: string;
  dataField: string;
  dataRenderer: string;
  visible: boolean;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
