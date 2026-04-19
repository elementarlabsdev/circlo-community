import { Publication } from '@/publications/domain/entities/publication.entity';

export const PUBLICATION_REPOSITORY = 'PUBLICATION_REPOSITORY';

export interface PublicationRepositoryInterface {
  findById(id: string): Promise<Publication | null>;
  findBySlug(slug: string): Promise<Publication | null>;
  findByHash(hash: string): Promise<Publication | null>;
  create(publication: Publication): Promise<void>;
  save(publication: Publication): Promise<void>;
  listPublished(params: { page: number; pageSize: number; channelId?: string; authorId?: string }): Promise<{ totalCount: number; items: Publication[]; pageSize: number }>;
}
