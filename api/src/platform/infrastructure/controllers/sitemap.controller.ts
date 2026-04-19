import {
  Controller,
  DefaultValuePipe,
  Get,
  Param,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { SitemapService } from '@/platform/application/services/sitemap.service';

@Controller('sitemap')
export class SitemapController {
  constructor(private readonly sitemap: SitemapService) {}

  @Get('index')
  async index(@Res({ passthrough: true }) res: Response) {
    res.header('Content-Type', 'application/xml');
    return this.sitemap.generateIndexXml();
  }

  @Get('publications/page/:pageNumber')
  async page(
    @Param('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number,
    @Res({ passthrough: true }) res: Response,
  ) {
    res.header('Content-Type', 'application/xml');
    return this.sitemap.generatePublicationsPageXml(pageNumber);
  }
}
