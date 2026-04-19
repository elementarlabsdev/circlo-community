import { Controller, Get, Param } from '@nestjs/common';
import { PagePublicService } from '@/pages/application/services/page-public.service';

@Controller('page')
export class PageController {
  constructor(private readonly pages: PagePublicService) {}

  @Get(':slug')
  async index(@Param('slug') slug: string) {
    return {
      page: await this.pages.findOneBySlug(slug),
    };
  }
}
