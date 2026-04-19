import { Injectable, inject } from '@angular/core';
import { ApiService } from '@/@services/api.service';

export interface UsersDataTableQuery {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  q?: string;
  // filters as key-value
  [key: string]: any;
}

export interface UsersDataTableResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminCreateUserDto {
  email: string;
  password?: string;
  roleId: string;
  name: string;
  username: string;
  verified?: boolean;
}

export interface AdminUpdateUserDto {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  roleId?: string;
  isBlocked?: boolean;
  verified?: boolean;
  isSuperAdmin?: boolean;
  cookieConsent?: boolean;
  cookiePreferences?: any;
}

@Injectable({ providedIn: 'root' })
export class UsersApi {
  private readonly api = inject(ApiService);
  private readonly base = 'platform/admin/users';

  paginate<T = any>(params?: any) {
    return this.api.post<UsersDataTableResponse<T>>(`${this.base}/table`, params);
  }

  list<T = any>(params?: any) {
    return this.paginate<T>(params);
  }

  findById<T = any>(id: string) {
    return this.api.get<T>(`${this.base}/${id}`);
  }

  listRoles() {
    return this.api.get<Array<{ id: string; name: string; type: string }>>(`${this.base}/roles`);
  }

  create(dto: AdminCreateUserDto) {
    return this.api.post<{ id: string }>(this.base, dto);
  }

  update(id: string, dto: AdminUpdateUserDto) {
    return this.api.put(`${this.base}/${id}`, dto);
  }

  delete(id: string) {
    return this.api.delete(`${this.base}/${id}`);
  }
}
