import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { PageEntity } from '@/pages/domain/entities/page.entity';
import { PageRepositoryInterface } from '@/pages/domain/repositories/page-repository.interface';

@Injectable()
export class PagesPrismaRepository implements PageRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(model: any): PageEntity {
    return PageEntity.reconstitute(model);
  }

  async findById(id: string): Promise<PageEntity | null> {
    const model = await this.prisma.page.findUnique({
      where: { id },
      include: {
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
    return model ? this.mapToEntity(model) : null;
  }

  async findBySlug(slug: string): Promise<PageEntity | null> {
    const model = await this.prisma.page.findFirst({
      where: { slug },
      include: {
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
    return model ? this.mapToEntity(model) : null;
  }

  async findByHash(hash: string): Promise<PageEntity | null> {
    const model = await this.prisma.page.findFirst({
      where: { hash },
      include: {
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
    return model ? this.mapToEntity(model) : null;
  }

  async create(page: PageEntity): Promise<void> {
    const p = page.toPrimitives();
    await this.prisma.page.create({
      data: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        hash: p.hash,
        textContent: p.textContent,
        blocksContent: p.blocksContent as any,
        authorId: p.authorId,
        statusId: p.statusId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        featuredImageId: p.featuredImageId,
        featuredImageUrl: p.featuredImageUrl,
        readingTime: p.readingTime,
        version: p.version,
        hasChanges: p.hasChanges,
        lastPublishedDraftVersion: p.lastPublishedDraftVersion,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt ?? undefined,
        publishedAt: p.publishedAt,
      },
    });
  }

  async save(page: PageEntity): Promise<void> {
    const p = page.toPrimitives();
    await this.prisma.page.update({
      where: { id: p.id },
      data: {
        title: p.title,
        slug: p.slug,
        textContent: p.textContent,
        blocksContent: p.blocksContent as any,
        authorId: p.authorId,
        statusId: p.statusId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        featuredImageId: p.featuredImageId,
        featuredImageUrl: p.featuredImageUrl,
        readingTime: p.readingTime,
        version: p.version,
        hasChanges: p.hasChanges,
        lastPublishedDraftVersion: p.lastPublishedDraftVersion,
        updatedAt: new Date(),
        publishedAt: p.publishedAt,
      },
    });
  }

  async listPublished(params: {
    page: number;
    pageSize: number;
  }): Promise<{ totalCount: number; items: PageEntity[]; pageSize: number }> {
    const { page, pageSize } = params;
    const where: any = {
      status: { type: 'published' } as any,
    };
    const totalCount = await this.prisma.page.count({ where });
    const models = await this.prisma.page.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishedAt: 'desc' },
    });
    return { totalCount, items: models.map((m) => this.mapToEntity(m)), pageSize };
  }
}
