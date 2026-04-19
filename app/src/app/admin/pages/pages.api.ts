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
    return this.api.post<{ page: { hash: string } }>(`${this.base}/create-new`, {});
  }

  getPage(hash: string) {
    return this.api.get<{ page: any }>(`${this.base}/${hash}`);
  }

  getContent(hash: string) {
    return this.api.get<{ page: any }>(`${this.base}/${hash}/content`);
  }

  saveContent(hash: string, payload: any) {
    return this.api.post<{ page: any }>(`${this.base}/${hash}/content`, payload);
  }

  getSettings(hash: string) {
    return this.api.get<{ page: any }>(`${this.base}/${hash}/settings`);
  }

  saveSettings(hash: string, payload: any) {
    return this.api.post<{ page: any }>(`${this.base}/${hash}/settings`, payload);
  }

  publish(hash: string) {
    return this.api.post<{ page: any }>(`${this.base}/${hash}/publish`);
  }

  unpublish(hash: string) {
    return this.api.post<{ page: any }>(`${this.base}/${hash}/unpublish`);
  }

  delete(hash: string) {
    return this.api.delete(`${this.base}/${hash}/delete`);
  }

  uploadFeaturedImage(hash: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.post<{ page: any }>(`${this.base}/${hash}/featured-image`, formData);
  }

  deleteFeaturedImage(hash: string) {
    return this.api.delete(`${this.base}/${hash}/featured-image`);
  }

  uploadInlineImage(hash: string, file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.post(`${this.base}/${hash}/upload/image`, formData);
  }
}
