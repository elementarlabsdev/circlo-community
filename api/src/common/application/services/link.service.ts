import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkService {
  constructor(private readonly configService: ConfigService) {}

  link(path: string | string[]): string {
    let baseUrl = this.configService.get('FRONTEND_URL');

    if (!baseUrl.endsWith('/')) {
      baseUrl += '/';
    }

    if (!Array.isArray(path)) {
      path = [path];
    }

    return baseUrl + path.join('/');
  }
}
