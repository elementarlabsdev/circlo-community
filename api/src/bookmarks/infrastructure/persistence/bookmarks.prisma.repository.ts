import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  BOOKMARK_REPOSITORY,
  BookmarkRepository,
} from '@/bookmarks/domain/repositories/bookmark-repository.interface';
import { Bookmark } from '@prisma/client';

@Injectable()
export class BookmarksPrismaRepository implements BookmarkRepository {
  constructor(private readonly prisma: PrismaService) {}

  async add(
    userId: string,
    targetId: string,
    targetType: string,
  ): Promise<Bookmark> {
    return this.prisma.bookmark.create({
      data: {
        user: { connect: { id: userId } },
        targetId,
        targetType,
      },
    });
  }

  async delete(
    userId: string,
    targetId: string,
    targetType: string,
  ): Promise<void> {
    await this.prisma.bookmark.deleteMany({
      where: { userId, targetId, targetType },
    });
  }

  async exists(
    userId: string,
    targetId: string,
    targetType: string,
  ): Promise<boolean> {
    const count = await this.prisma.bookmark.count({
      where: { userId, targetId, targetType },
    });
    return count > 0;
  }

  async findManyByUser(
    userId: string,
    pageNumber: number,
    pageSize: number,
  ): Promise<Bookmark[]> {
    return this.prisma.bookmark.findMany({
      where: { user: { id: userId } },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
      orderBy: { createdAt: 'desc' },
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.bookmark.count({ where: { user: { id: userId } } });
  }
}

export const BOOKMARKS_REPOSITORY_PROVIDER = {
  provide: BOOKMARK_REPOSITORY,
  useClass: BookmarksPrismaRepository,
};
