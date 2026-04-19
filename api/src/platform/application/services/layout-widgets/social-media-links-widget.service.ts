import { Injectable } from '@nestjs/common';
import { SocialMediaLinkService } from '@/platform/application/services/social-media-link.service';

@Injectable()
export class SocialMediaLinksWidgetService {
  constructor(private _socialMediaLinksService: SocialMediaLinkService) {}

  async getData() {
    return this._socialMediaLinksService.findAllActive();
  }
}
