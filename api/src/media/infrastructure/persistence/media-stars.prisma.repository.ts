import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MediaStarEntity } from '@/media/domain/entities/media-star.entity';
import { MEDIA_STAR_REPOSITORY, MediaStarRepositoryInterface } from '@/media/domain/repositories/media-star-repository.interface';

function mapToEntity(row: any): MediaStarEntity {
  return MediaStarEntity.reconstitute({
    id: row.id,
    userId: row.userId,
    mediaItemId: row.mediaItemId,
  });
}

@Injectable()
export class MediaStarsPrismaRepository implements MediaStarRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaStarEntity | null> {
    const row = await this.prisma.mediaStar.findUnique({ where: { id } });
    return row ? mapToEntity(row) : null;
  }

  async findByUserAndMediaItem(userId: string, mediaItemId: string): Promise<MediaStarEntity | null> {
    const row = await this.prisma.mediaStar.findFirst({ where: { userId, mediaItemId } });
    return row ? mapToEntity(row) : null;
  }

  async findManyByUser(
    userId: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ total: number; items: MediaStarEntity[]; page: number; pageSize: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;

    const where = { userId } as const;

    const [total, rows] = await Promise.all([
      this.prisma.mediaStar.count({ where }),
      this.prisma.mediaStar.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { id: 'desc' },
      }),
    ]);

    return { total, items: rows.map(mapToEntity), page, pageSize };
  }

  async add(userId: string, mediaItemId: string): Promise<MediaStarEntity> {
    const row = await this.prisma.mediaStar.create({
      data: {
        user: { connect: { id: userId } },
        mediaItem: { connect: { id: mediaItemId } },
      },
    });
    return mapToEntity(row);
  }

  async delete(userId: string, mediaItemId: string): Promise<void> {
    await this.prisma.mediaStar.deleteMany({ where: { userId, mediaItemId } });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.mediaStar.count({ where: { userId } });
  }
}

export const MEDIA_STARS_REPOSITORY_PROVIDER = {
  provide: MEDIA_STAR_REPOSITORY,
  useClass: MediaStarsPrismaRepository,
};
