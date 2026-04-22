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
export class PagesApi {
  private readonly api = inject(ApiService);
  private readonly base = 'admin/pages';

  paginate<T = any>(params?: DataTableQuery) {
    return this.api.post<DataTableResponse<T>>(`${this.base}/table`, params);
  }

  list<T = any>(params?: DataTableQuery) {
    return this.paginate<T>(params);
  }

  createNew() {
    return this.api.post<{ page: { id: string, hash: string } }>(`${this.base}/create-new`, {});
  }

  getPage(id: string) {
    return this.api.get<{ page: any }>(`${this.base}/${id}`);
  }

  getContent(id: string) {
    return this.api.get<{ page: any }>(`${this.base}/${id}/content`);
  }

  saveContent(id: string, payload: any) {
    return this.api.post<{ page: any }>(`${this.base}/${id}/content`, payload);
  }

  getSettings(id: string) {
    return this.api.get<{ page: any }>(`${this.base}/${id}/settings`);
  }

  saveSettings(id: string, payload: any) {
    return this.api.post<{ page: any }>(`${this.base}/${id}/settings`, payload);
  }

  publish(id: string) {
    return this.api.post<{ page: any }>(`${this.base}/${id}/publish`);
  }

  unpublish(id: string) {
    return this.api.post<{ page: any }>(`${this.base}/${id}/unpublish`);
  }

  delete(id: string) {
    return this.api.delete(`${this.base}/${id}/delete`);
  }

  uploadFeaturedImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.post<{ page: any }>(`${this.base}/${id}/featured-image`, formData);
  }

  deleteFeaturedImage(id: string) {
    return this.api.delete(`${this.base}/${id}/featured-image`);
  }

  uploadInlineImage(id: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.post(`${this.base}/${id}/upload/image`, formData);
  }
}
