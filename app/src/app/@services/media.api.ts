import { inject, Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class MediaApi {
  private readonly api = inject(ApiService);

  paginate(params?: DataTableQuery, isAdmin: boolean = true): Observable<DataTableResponse> {
    const endpoint = isAdmin ? 'admin/media/table' : 'studio/media/table';
    return this.api.post(endpoint, params);
  }
}
