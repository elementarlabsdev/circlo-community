import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  Tutorial,
  TutorialStatusType,
} from '../../domain/entities/tutorial.entity';
import { TutorialsRepositoryInterface } from '@/tutorials/domain/repositories/tutorials-repository.interface';

@Injectable()
export class TutorialsPrismaRepository implements TutorialsRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<Tutorial | null> {
    const t = await this.prisma.tutorial.findUnique({
      where: { id },
      include: { status: true },
    });
    if (!t) return null;
    return this.map(t);
  }

  async findPublishedPage(pagination: { page: number; limit: number }) {
    const skip = (pagination.page - 1) * pagination.limit;
    const where = { status: { type: 'published' as const } };
    const [total, list] = await this.prisma.$transaction([
      this.prisma.tutorial.count({ where }),
      this.prisma.tutorial.findMany({
        where,
        skip,
        take: pagination.limit,
        include: { status: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    return { items: list.map((t) => this.map(t)), total };
  }

  async findByAuthor(
    authorId: string,
    pagination: { page: number; limit: number },
    status?: TutorialStatusType,
  ) {
    const skip = (pagination.page - 1) * pagination.limit;
    const where: any = { authorId };
    if (status) where.status = { type: status };
    const [total, list] = await this.prisma.$transaction([
      this.prisma.tutorial.count({ where }),
      this.prisma.tutorial.findMany({
        where,
        skip,
        take: pagination.limit,
        include: { status: true },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    return { items: list.map((t) => this.map(t)), total };
  }

  async countByAuthor(authorId: string): Promise<number> {
    return this.prisma.tutorial.count({ where: { authorId } });
  }

  async countByAuthorAndStatus(
    authorId: string,
    status: TutorialStatusType,
  ): Promise<number> {
    return this.prisma.tutorial.count({
      where: { authorId, status: { type: status } },
    });
  }

  async createDraft(
    authorId: string,
    defaultName?: string,
  ): Promise<Tutorial> {
    // Create initial draft (first version), then set rootId to self and revision to 1
    const defaultLicense = await this.prisma.licenseType.findFirstOrThrow({
      where: { isDefault: true },
    });
    const created = await this.prisma.tutorial.create({
      data: {
        title: defaultName ?? 'Untitled Tutorial',
        description: null,
        author: { connect: { id: authorId } },
        status: { connect: { type: 'draft' } },
        licenseType: { connect: { id: defaultLicense.id } },
        revision: 1,
      },
      include: { status: true },
    });

    // Ensure root relation points to the root (self for the first version)
    if (!('rootId' in created) || !created.rootId) {
      await this.prisma.tutorial.update({
        where: { id: created.id },
        data: { root: { connect: { id: created.id } } },
      });
    }
    return this.map(created);
  }

  async update(entity: Tutorial): Promise<void> {
    await this.prisma.tutorial.update({
      where: { id: entity.id },
      data: {
        title: entity.title,
        description: entity.description,
        featuredImageUrl: entity.featuredImageUrl ?? undefined,
        // Use relation writes for channel to satisfy Prisma's checked update type
        channel:
          entity.channelId == null
            ? { disconnect: true }
            : { connect: { id: entity.channelId } },
        lessonsCount: entity.lessonsCount,
        status: { connect: { type: entity.status } },
        publishedAt: entity.publishedAt ?? undefined,
      },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.tutorial.delete({ where: { id } });
  }

  private map(t: any): Tutorial {
    return Tutorial.reconstitute({
      id: t.id,
      title: t.title,
      description: t.description,
      authorId: t.authorId,
      featuredImageUrl: t.featuredImageUrl ?? null,
      channelId: t.channelId ?? null,
      lessonsCount: t.lessonsCount ?? 0,
      status: (t.status?.type ?? 'draft') as TutorialStatusType,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
      publishedAt: t.publishedAt ?? null,
    });
  }
}
