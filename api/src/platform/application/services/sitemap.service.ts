import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommonPublicationListService } from '@/publications/application/services/common-publication-list.service';
import { SitemapIndexStream, SitemapStream } from 'sitemap';
import { Publication } from '@prisma/client';
const { streamToPromise } = require('sitemap');
const { Readable } = require('stream');

@Injectable()
export class SitemapService {
  constructor(
    private readonly config: ConfigService,
    private readonly publicationList: CommonPublicationListService,
  ) {}

  async generateIndexXml(): Promise<string> {
    const hostName = this.config.get<string>('FRONTEND_URL');
    const totalPages = await this.publicationList.getSitemapPages();
    const links: { url: string; changefreq?: string }[] = [];

    for (let page = 0; page < totalPages; page++) {
      links.push({
        // Keep existing URL structure
        url: `${hostName}/sitemap/publications/${page + 1}.xml`,
        changefreq: 'daily',
      });
    }

    const stream = new SitemapIndexStream();
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    return xml.toString();
  }

  async generatePublicationsPageXml(pageNumber: number): Promise<string | undefined> {
    if (pageNumber < 1) pageNumber = 1;

    const hostName = this.config.get<string>('FRONTEND_URL');
    const publications = await this.publicationList.getLatestForSitemap(pageNumber);

    if (!publications?.length) return undefined;

    const links: { url: string }[] = [];
    publications.forEach((publication: Publication) => {
      links.push({ url: `/publication/${publication.slug}` });
    });

    const stream = new SitemapStream({ hostname: hostName });
    const xml = await streamToPromise(Readable.from(links).pipe(stream));
    return xml.toString();
  }
}
