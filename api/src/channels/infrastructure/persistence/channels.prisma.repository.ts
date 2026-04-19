import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ChannelEntity } from '@/channels/domain/entities/channel.entity';
import { ChannelRepositoryInterface } from '@/channels/domain/repositories/channel-repository.interface';

@Injectable()
export class ChannelsPrismaRepository implements ChannelRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private mapToEntity(model: any): ChannelEntity {
    return ChannelEntity.reconstitute(model);
  }

  async findById(id: string): Promise<ChannelEntity | null> {
    const model = await this.prisma.channel.findUnique({ where: { id } });
    return model ? this.mapToEntity(model) : null;
  }

  async findBySlug(slug: string): Promise<ChannelEntity | null> {
    const model = await this.prisma.channel.findUnique({ where: { slug } });
    return model ? this.mapToEntity(model) : null;
  }

  async findByOwnerId(ownerId: string): Promise<ChannelEntity | null> {
    const model = await this.prisma.channel.findFirst({ where: { ownerId } });
    return model ? this.mapToEntity(model) : null;
  }

  async findAllPublicOrdered(): Promise<ChannelEntity[]> {
    const models = await this.prisma.channel.findMany({
      where: {
        visibility: {
          type: {
            in: ['public', 'private'],
          },
        },
      } as any,
      orderBy: [
        { publicationsCount: 'desc' },
        { followersCount: 'desc' },
      ],
    });
    return models.map((m) => this.mapToEntity(m));
  }

  async searchPublic(query: string, page = 1, pageSize = 20): Promise<{ totalCount: number; items: ChannelEntity[]; pageSize: number }> {
    const where: any = {
      visibility: {
        type: {
          in: ['public', 'private'],
        },
      },
    };
    if (query?.trim()) {
      where.name = { contains: query.trim(), mode: 'insensitive' };
    }

    const totalCount = await this.prisma.channel.count({ where });
    const models = await this.prisma.channel.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: [
        { publicationsCount: 'desc' },
        { followersCount: 'desc' },
      ],
    });

    return { totalCount, items: models.map((m) => this.mapToEntity(m)), pageSize };
  }

  async isSlugTaken(slug: string, excludeId?: string): Promise<boolean> {
    const count = await this.prisma.channel.count({
      where: { slug, id: excludeId ? { notIn: [excludeId] } : undefined } as any,
    });
    return count > 0;
  }

  async create(channel: ChannelEntity): Promise<void> {
    const data = channel.toPrimitives();
    await this.prisma.channel.create({
      data: {
        id: data.id,
        name: data.name,
        description: data.description ?? null,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt ?? undefined,
        publicationsCount: data.publicationsCount,
        followersCount: data.followersCount,
        ownerId: data.ownerId ?? null,
        visibilityId: data.visibilityId,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
  }

  async save(channel: ChannelEntity): Promise<void> {
    const data = channel.toPrimitives();
    await this.prisma.channel.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description ?? null,
        slug: data.slug,
        logoUrl: data.logoUrl ?? null,
        updatedAt: new Date(),
        publicationsCount: data.publicationsCount,
        followersCount: data.followersCount,
        ownerId: data.ownerId ?? null,
        visibilityId: data.visibilityId,
        metaTitle: data.metaTitle ?? null,
        metaDescription: data.metaDescription ?? null,
      },
    });
  }
}
