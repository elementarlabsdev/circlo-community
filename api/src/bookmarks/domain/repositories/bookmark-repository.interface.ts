import { Bookmark } from '@prisma/client';

export interface BookmarkPagination {
  totalItems: number;
  totalPages: number;
  pageSize: number;
  pageNumber: number;
}

export interface BookmarkRepository {
  add(userId: string, targetId: string, targetType: string): Promise<Bookmark>;
  delete(userId: string, targetId: string, targetType: string): Promise<void>;
  exists(userId: string, targetId: string, targetType: string): Promise<boolean>;
  findManyByUser(userId: string, pageNumber: number, pageSize: number): Promise<Bookmark[]>;
  countByUser(userId: string): Promise<number>;
}

export const BOOKMARK_REPOSITORY = Symbol('BOOKMARK_REPOSITORY');
