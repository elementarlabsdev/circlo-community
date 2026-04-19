import { Injectable, inject } from '@angular/core';
import { ApiService } from '@/@services/api.service';

@Injectable({ providedIn: 'root' })
export class StudioChannelsApi {
  private readonly api = inject(ApiService);
  private readonly base = 'studio/channels';

  getMyChannels() {
    return this.api.get<{ channels: any[] }>(this.base);
  }

  getOne(id: string) {
    return this.api.get<{ channel: any }>(`${this.base}/${id}`);
  }

  getVisibilities() {
    return this.api.get<{ visibilities: any[] }>(`${this.base}/visibilities`);
  }

  create(channelDto: any) {
    return this.api.post<{ channelId: string }>(this.base, channelDto);
  }

  update(id: string, channelDto: any) {
    return this.api.put(`${this.base}/${id}`, channelDto);
  }

  delete(id: string) {
    return this.api.delete(`${this.base}/${id}`);
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('image', file);
    return this.api.post<{ file: any }>('admin/channels/logo/upload', formData);
  }
}
