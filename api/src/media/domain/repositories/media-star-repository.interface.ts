import { MediaStarEntity } from '@/media/domain/entities/media-star.entity';

export const MEDIA_STAR_REPOSITORY = 'MEDIA_STAR_REPOSITORY';

export interface MediaStarRepositoryInterface {
  findById(id: string): Promise<MediaStarEntity | null>;
  findByUserAndMediaItem(userId: string, mediaItemId: string): Promise<MediaStarEntity | null>;
  findManyByUser(
    userId: string,
    options?: { page?: number; pageSize?: number },
  ): Promise<{ total: number; items: MediaStarEntity[]; page: number; pageSize: number }>;
  add(userId: string, mediaItemId: string): Promise<MediaStarEntity>;
  delete(userId: string, mediaItemId: string): Promise<void>;
  countByUser(userId: string): Promise<number>;
}
