import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { TopicEntity } from '@/topics/domain/entities/topic.entity';
import { TopicRepositoryInterface } from '@/topics/domain/repositories/topic-repository.interface';

@Injectable()
export class TopicsPrismaRepository implements TopicRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(model: any): TopicEntity {
    return TopicEntity.reconstitute(model);
  }

  async findById(id: string): Promise<TopicEntity | null> {
    const model = await this.prisma.topic.findUnique({ where: { id } });
    return model ? this.mapToEntity(model) : null;
  }

  async findBySlug(slug: string): Promise<TopicEntity | null> {
    const model = await this.prisma.topic.findUnique({ where: { slug } });
    return model ? this.mapToEntity(model) : null;
  }

  async findAllOrdered(): Promise<TopicEntity[]> {
    const models = await this.prisma.topic.findMany({
      orderBy: [{ publicationsCount: 'desc' }, { followersCount: 'desc' }],
    });
    return models.map((m) => this.mapToEntity(m));
  }

  async search(
    query: string,
    page = 1,
    pageSize = 20,
  ): Promise<{ totalCount: number; items: TopicEntity[]; pageSize: number }> {
    const where: any = {};
    if (query?.trim()) {
      where.name = { contains: query.trim(), mode: 'insensitive' };
    }

    const totalCount = await this.prisma.topic.count({ where });
    const models = await this.prisma.topic.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [{ publicationsCount: 'desc' }, { followersCount: 'desc' }],
    });

    return {
      totalCount,
      items: models.map((m) => this.mapToEntity(m)),
      pageSize,
    };
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.topic.count({
      where: {
        slug,
        id: excludeId ? { notIn: [excludeId] } : undefined,
      } as any,
    });
    return count > 0;
  }

  async create(topic: TopicEntity): Promise<void> {
    const data = topic.toPrimitives();
    await this.prisma.topic.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        allowCustomPrice: data.allowCustomPrice,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt ?? undefined,
        publicationsCount: data.publicationsCount,
        followersCount: data.followersCount,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        tutorialId: data.tutorialId ?? null,
      },
    });
  }

  async save(topic: TopicEntity): Promise<void> {
    const data = topic.toPrimitives();
    await this.prisma.topic.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description ?? null,
        allowCustomPrice: data.allowCustomPrice,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        updatedAt: new Date(),
        publicationsCount: data.publicationsCount,
        followersCount: data.followersCount,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
        tutorialId: data.tutorialId ?? null,
      },
    });
  }
}
