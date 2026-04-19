import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Publication } from '@/publications/domain/entities/publication.entity';
import { PublicationRepositoryInterface } from '@/publications/domain/repositories/publication-repository.interface';

@Injectable()
export class PublicationsPrismaRepository
  implements PublicationRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(model: any): Publication {
    return Publication.reconstitute(model);
  }

  async findById(id: string): Promise<Publication | null> {
    const model = await this.prisma.publication.findUnique({
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

  async findBySlug(slug: string): Promise<Publication | null> {
    const model = await this.prisma.publication.findFirst({
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

  async findByHash(hash: string): Promise<Publication | null> {
    const model = await this.prisma.publication.findFirst({
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

  async create(publication: Publication): Promise<void> {
    const p = publication.toPrimitives();
    await this.prisma.publication.create({
      data: {
        id: p.id,
        title: p.title,
        slug: p.slug,
        hash: p.hash,
        textContent: p.textContent,
        blocksContent: p.blocksContent as any,
        authorId: p.authorId,
        channelId: p.channelId,
        statusId: p.statusId,
        typeId: p.typeId,
        licenseTypeId: p.licenseTypeId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        canonicalUrl: p.canonicalUrl,
        readingTime: p.readingTime,
        viewsCount: p.viewsCount,
        pinned: p.pinned,
        discussionEnabled: p.discussionEnabled,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt ?? undefined,
        publishedAt: p.publishedAt,
      },
    });
  }

  async save(publication: Publication): Promise<void> {
    const p = publication.toPrimitives();
    await this.prisma.publication.update({
      where: { id: p.id },
      data: {
        title: p.title,
        slug: p.slug,
        textContent: p.textContent,
        blocksContent: p.blocksContent as any,
        authorId: p.authorId,
        channelId: p.channelId,
        statusId: p.statusId,
        typeId: p.typeId,
        licenseTypeId: p.licenseTypeId,
        metaTitle: p.metaTitle,
        metaDescription: p.metaDescription,
        canonicalUrl: p.canonicalUrl,
        readingTime: p.readingTime,
        viewsCount: p.viewsCount,
        pinned: p.pinned,
        discussionEnabled: p.discussionEnabled,
        updatedAt: new Date(),
        publishedAt: p.publishedAt,
      },
    });
  }

  async listPublished(params: {
    page: number;
    pageSize: number;
    channelId?: string;
    authorId?: string;
  }): Promise<{
    totalCount: number;
    items: Publication[];
    pageSize: number;
  }> {
    const { page, pageSize, channelId, authorId } = params;
    const where: any = {
      status: { type: 'published' } as any,
      channelId: channelId ?? undefined,
      authorId: authorId ?? undefined,
    };
    const totalCount = await this.prisma.publication.count({ where });
    const models = await this.prisma.publication.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { publishedAt: 'desc' },
    });
    return {
      totalCount,
      items: models.map((m) => this.mapToEntity(m)),
      pageSize,
    };
  }
}
