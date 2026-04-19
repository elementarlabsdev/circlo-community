import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThreadService {
  private _apiService = inject(ApiService);

  create(content: string, mediaItemIds: string[] = [], parentId?: string): Observable<any> {
    return this._apiService.post('threads', { content, mediaItemIds, parentId });
  }

  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this._apiService.post('studio/media/upload', formData);
  }

  delete(id: string): Observable<any> {
    return this._apiService.post(`threads/${id}/delete`, {});
  }
}
