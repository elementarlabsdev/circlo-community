import { Injectable, inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TutorialsApi {
  private readonly api = inject(ApiService);
  private readonly base = 'admin/tutorials';

  // POST platform/admin/tutorials/table
  paginate(params?: any): Observable<any> {
    return this.api.post(`${this.base}/table`, params);
  }

  list(params?: any): Observable<any> {
    return this.paginate(params);
  }

  // POST platform/admin/tutorials/:id/unpublish
  unpublish(id: string): Observable<any> {
    return this.api.post(`${this.base}/${id}/unpublish`);
  }

  // DELETE platform/admin/tutorials/:id/delete
  delete(id: string): Observable<any> {
    return this.api.delete(`${this.base}/${id}/delete`);
  }

  // POST platform/admin/tutorials/bulk-unpublish
  bulkUnpublish(ids: string[]): Observable<any> {
    return this.api.post(`${this.base}/bulk-unpublish`, { ids });
  }

  // DELETE platform/admin/tutorials/bulk-delete with body
  bulkDelete(ids: string[]): Observable<any> {
    return this.api.delete(`${this.base}/bulk-delete`, { body: { ids } } as any);
  }
}
