import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MediaItemEntity, MediaItemProps } from '@/media/domain/entities/media-item.entity';
import { MEDIA_ITEM_REPOSITORY, MediaItemRepositoryInterface } from '@/media/domain/repositories/media-item-repository.interface';

function mapToEntity(row: any): MediaItemEntity {
  const props: MediaItemProps = {
    id: row.id,
    extension: row.extension,
    path: row.path,
    url: row.url,
    name: row.name,
    size: row.size,
    category: row.category,
    type: row.type,
    mimeType: row.mimeType,
    deleted: row.deleted,
    temporary: row.temporary,
    createdAt: row.createdAt,
    uploadedById: row.uploadedById,
    fileStorageProviderId: row.fileStorageProviderId,
    folderId: row.folderId ?? null,
  };
  return MediaItemEntity.reconstitute(props);
}

@Injectable()
export class MediaItemsPrismaRepository implements MediaItemRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MediaItemEntity | null> {
    const row = await this.prisma.mediaItem.findUnique({ where: { id } });
    return row ? mapToEntity(row) : null;
    }

  async findManyByUser(
    userId: string,
    options?: { page?: number; pageSize?: number; orderBy?: 'createdAt' | 'name' | 'size'; orderDir?: 'asc' | 'desc' },
  ): Promise<{ total: number; items: MediaItemEntity[]; page: number; pageSize: number }> {
    const page = options?.page ?? 1;
    const pageSize = options?.pageSize ?? 10;
    const orderByField = options?.orderBy ?? 'createdAt';
    const orderDir = options?.orderDir ?? 'desc';

    const where = { uploadedBy: { id: userId } } as const;

    const [total, rows] = await Promise.all([
      this.prisma.mediaItem.count({ where }),
      this.prisma.mediaItem.findMany({
        where,
        orderBy: { [orderByField]: orderDir },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      total,
      items: rows.map(mapToEntity),
      page,
      pageSize,
    };
  }

  async create(entity: MediaItemEntity): Promise<void> {
    const data = entity.toPrimitives();
    await this.prisma.mediaItem.create({
      data: {
        id: data.id,
        extension: data.extension,
        path: data.path,
        url: data.url,
        name: data.name,
        size: data.size,
        category: data.category,
        type: data.type,
        mimeType: data.mimeType,
        deleted: data.deleted,
        temporary: data.temporary,
        createdAt: data.createdAt,
        uploadedBy: { connect: { id: data.uploadedById } },
        fileStorageProvider: { connect: { id: data.fileStorageProviderId } },
        folder: data.folderId ? { connect: { id: data.folderId } } : undefined,
      },
    });
  }

  async save(entity: MediaItemEntity): Promise<void> {
    const data = entity.toPrimitives();
    await this.prisma.mediaItem.update({
      where: { id: data.id },
      data: {
        extension: data.extension,
        path: data.path,
        url: data.url,
        name: data.name,
        size: data.size,
        category: data.category,
        type: data.type,
        mimeType: data.mimeType,
        deleted: data.deleted,
        temporary: data.temporary,
        uploadedById: data.uploadedById,
        fileStorageProviderId: data.fileStorageProviderId,
        folderId: data.folderId ?? null,
      },
    });
  }

  async softDelete(id: string): Promise<void> {
    await this.prisma.mediaItem.update({ where: { id }, data: { deleted: true } });
  }
}

export const MEDIA_ITEMS_REPOSITORY_PROVIDER = {
  provide: MEDIA_ITEM_REPOSITORY,
  useClass: MediaItemsPrismaRepository,
};
