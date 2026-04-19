import { Injectable, inject } from '@angular/core';
import { ApiService } from '@services/api.service';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PublicationsApi {
  private readonly api = inject(ApiService);
  private readonly base = 'admin/publications';

  // POST platform/admin/publications/table
  paginate(params?: any): Observable<any> {
    return this.api.post(`${this.base}/table`, params);
  }

  list(params?: any): Observable<any> {
    return this.paginate(params);
  }

  // POST platform/admin/publications/:hash/unpublish
  unpublish(hash: string): Observable<any> {
    return this.api.post(`${this.base}/${hash}/unpublish`);
  }

  // DELETE platform/admin/publications/:hash/delete
  delete(hash: string): Observable<any> {
    return this.api.delete(`${this.base}/${hash}/delete`);
  }

  // POST platform/admin/publications/bulk-unpublish
  bulkUnpublish(hashes: string[]): Observable<any> {
    return this.api.post(`${this.base}/bulk-unpublish`, { hashes });
  }

  // DELETE platform/admin/publications/bulk-delete
  bulkDelete(hashes: string[]): Observable<any> {
    // Some backends expect body in DELETE; ApiService likely supports it.
    return this.api.delete(`${this.base}/bulk-delete`, { body: { hashes } } as any);
  }
}
