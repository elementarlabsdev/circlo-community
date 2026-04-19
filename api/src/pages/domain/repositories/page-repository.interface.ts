import { PageEntity } from '@/pages/domain/entities/page.entity';

export const PAGE_REPOSITORY = 'PAGE_REPOSITORY';

export interface PageRepositoryInterface {
  findById(id: string): Promise<PageEntity | null>;
  findBySlug(slug: string): Promise<PageEntity | null>;
  findByHash(hash: string): Promise<PageEntity | null>;
  create(page: PageEntity): Promise<void>;
  save(page: PageEntity): Promise<void>;
  listPublished(params: {
    page: number;
    pageSize: number;
  }): Promise<{ totalCount: number; items: PageEntity[]; pageSize: number }>;
}
