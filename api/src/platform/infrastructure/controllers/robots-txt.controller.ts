import { Controller, Get } from '@nestjs/common';
import { RobotsTxtService } from '@/platform/application/services/robots-txt.service';

@Controller('robots-txt')
export class RobotsTxtController {
  constructor(private readonly robots: RobotsTxtService) {}

  @Get()
  async index() {
    return this.robots.getContent();
  }
}
