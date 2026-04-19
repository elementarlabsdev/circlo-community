import {
  Tutorial,
  TutorialStatusType,
} from '../entities/tutorial.entity';

export interface Pagination {
  page: number;
  limit: number;
}

export const TUTORIAL_REPOSITORY = 'TUTORIAL_REPOSITORY';

export interface TutorialsRepositoryInterface {
  findById(id: string): Promise<Tutorial | null>;
  findBySlug?(slug: string): Promise<Tutorial | null>;
  findPublishedPage(pagination: Pagination): Promise<{
    items: Tutorial[];
    total: number;
  }>;
  findByAuthor(
    authorId: string,
    pagination: Pagination,
    status?: TutorialStatusType,
  ): Promise<{
    items: Tutorial[];
    total: number;
  }>;
  countByAuthor(authorId: string): Promise<number>;
  countByAuthorAndStatus(
    authorId: string,
    status: TutorialStatusType,
  ): Promise<number>;
  createDraft(authorId: string, defaultName?: string): Promise<Tutorial>;
  update(entity: Tutorial): Promise<void>;
  delete(id: string): Promise<void>;
}
