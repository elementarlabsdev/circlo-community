import { MediaItemEntity } from '@/media/domain/entities/media-item.entity';

export const MEDIA_ITEM_REPOSITORY = 'MEDIA_ITEM_REPOSITORY';

export interface MediaItemRepositoryInterface {
  findById(id: string): Promise<MediaItemEntity | null>;
  findManyByUser(userId: string, options?: {
    page?: number;
    pageSize?: number;
    orderBy?: 'createdAt' | 'name' | 'size';
    orderDir?: 'asc' | 'desc';
  }): Promise<{ total: number; items: MediaItemEntity[]; page: number; pageSize: number }>;
  create(entity: MediaItemEntity): Promise<void>;
  save(entity: MediaItemEntity): Promise<void>;
  softDelete(id: string): Promise<void>;
}
