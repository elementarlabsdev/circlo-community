import { Injectable, inject } from '@angular/core';
import { ApiService } from '@/@services/api.service';

export interface AdminAnnouncementDto {
  name: string;
  content: string;
  statusType: string;
  typeType: string;
  priority?: number;
  dismissable?: boolean;
  requireManualDismiss?: boolean;
  targetUrl?: string;
  actionText?: string;
  startAt?: string;
  endAt?: string;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementsApi {
  private readonly api = inject(ApiService);
  private readonly base = 'platform/admin/announcements';

  paginate<T = any>(params?: any) {
    return this.api.post<any>(`${this.base}/table`, params);
  }

  list<T = any>(params?: any) {
    return this.paginate<T>(params);
  }

  findById<T = any>(id: string) {
    return this.api.get<T>(`${this.base}/${id}`);
  }

  create(dto: AdminAnnouncementDto) {
    return this.api.post<{ id: string }>(this.base, dto);
  }

  update(id: string, dto: AdminAnnouncementDto) {
    return this.api.put(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.api.delete(`${this.base}/${id}`);
  }

  getTypes() {
    return this.api.get<any[]>(`${this.base}/meta/types`);
  }

  getStatuses() {
    return this.api.get<any[]>(`${this.base}/meta/statuses`);
  }
}
