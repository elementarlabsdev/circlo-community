import { Injectable } from '@nestjs/common';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class RobotsTxtService {
  constructor(private readonly settings: SettingsService) {}

  async getContent(): Promise<string> {
    const content = await this.settings.findValueByName('robotsTxtContent');
    return content as any;
  }
}
