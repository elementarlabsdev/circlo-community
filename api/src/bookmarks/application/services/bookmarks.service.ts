import { Inject, Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { BOOKMARK_REPOSITORY, BookmarkRepository } from '@/bookmarks/domain/repositories/bookmark-repository.interface';

@Injectable()
export class BookmarksService {
  constructor(
    @Inject(BOOKMARK_REPOSITORY)
    private readonly repository: BookmarkRepository,
  ) {}

  async add(user: any, targetId: string, targetType: string) {
    return this.repository.add(user.id, targetId, targetType);
  }

  async exists(
    user: any,
    targetId: string,
    targetType: string,
  ): Promise<boolean> {
    if (!user) {
      return false;
    }

    return this.repository.exists(user.id, targetId, targetType);
  }

  async delete(user: any, targetId: string, targetType: string) {
    await this.repository.delete(user.id, targetId, targetType);
  }

  async get(user: User, targetId: string, targetType: string) {
    if (!user) {
      return null;
    }

    const exists = await this.repository.exists(user.id, targetId, targetType);
    return exists ? { id: targetId } : null;
  }
}
