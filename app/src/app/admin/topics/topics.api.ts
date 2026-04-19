import { Injectable, inject } from '@angular/core';
import { ApiService } from '@/@services/api.service';

export interface DataTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
  globalFilter?: string;
  [key: string]: any;
}

export interface DataTableResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({ providedIn: 'root' })
export class TopicsApi {
  private readonly api = inject(ApiService);
  private readonly base = 'admin/topics';

  paginate<T = any>(params?: DataTableQuery) {
    return this.api.post<DataTableResponse<T>>(`${this.base}/table`, params);
  }

  list<T = any>(params?: DataTableQuery) {
    return this.paginate<T>(params);
  }

  delete(id: string) {
    return this.api.delete(`${this.base}/${id}`);
  }

  bulkDelete(ids: string[]) {
    return this.api.delete(`${this.base}/bulk-delete`, { ids });
  }
}
