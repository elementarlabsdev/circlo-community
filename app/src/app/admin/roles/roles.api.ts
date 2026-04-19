import { inject, Injectable } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

export interface Role {
  id: string;
  type: string;
  name: string;
  isBuiltIn: boolean;
}

export interface RolesDataTableResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable({
  providedIn: 'root'
})
export class RolesApi {
  private _api = inject(ApiService);
  private _base = 'admin/roles';

  findAll(): Observable<Role[]> {
    return this._api.get(this._base);
  }

  paginate(params?: any): Observable<RolesDataTableResponse<Role>> {
    return this._api.post(`${this._base}/table`, params);
  }

  findById(id: string): Observable<Role> {
    return this._api.get(`${this._base}/${id}`);
  }

  create(data: Partial<Role>): Observable<Role> {
    return this._api.post(this._base, data);
  }

  update(id: string, data: Partial<Role>): Observable<Role> {
    return this._api.patch(`${this._base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this._api.delete(`${this._base}/${id}`);
  }
}
