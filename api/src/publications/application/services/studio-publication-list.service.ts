import { Injectable } from '@nestjs/common';
import { Publication, User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FeedService } from '@/feed/application/services/feed.service';

@Injectable()
export class StudioPublicationListService {
  constructor(private _prisma: PrismaService, private readonly feed: FeedService) {}

  async getCountByUser(user: User) {
    const where = {
      author: {
        id: user.id,
      },
    };
    return this._prisma.publication.count({
      where: {
        ...where,
      },
    });
  }

  async getCountByStatusType(
    statusType: string,
    author: User,
    search = '',
  ): Promise<number> {
    const where = {
      author: {
        id: author.id,
      },
      status: {
        type: statusType,
      },
    };

    if (search) {
      where['title'] = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return this._prisma.publication.count({
      where: {
        ...where,
      },
    });
  }

  async findPaginatedPublished(
    pageSize: number,
    pageNumber: number,
    statusType: string,
    author: User,
    search = '',
    sortState = null,
  ) {
    const where = {};
    let orderBy: any = {
      publishedAt: 'desc',
    };

    if (search) {
      where['title'] = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Publication[] = await this._prisma.publication.findMany({
      where: {
        status: {
          type: statusType,
        },
        author: {
          id: author.id,
        },
        ...where,
      },
      orderBy: {
        ...orderBy,
      },
      include: {
        channel: true,
        status: true,
        topics: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.publication.count({
      where: {
        status: {
          type: statusType,
        },
        author: {
          id: author.id,
        },
      },
    });
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    return {
      items,
      pagination,
    };
  }

  async unpublish(hash: string, author: User) {
    const statusDraft = await this._prisma.publicationStatus.findUnique({
      where: {
        type: 'draft',
      },
    });

    const publication = await this._prisma.publication.findFirst({
      where: {
        hash,
        author: { id: author.id },
      },
      select: { id: true },
    });

    if (!publication) {
      return;
    }

    await this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        statusId: statusDraft.id,
      },
    });
    this._prisma.user.update({
      where: {
        id: author.id,
      },
      data: {
        publicationsCount: {
          decrement: 1,
        },
      },
    });

    // Hide from feed (idempotent)
    await this.feed.onUnpublished({
      targetType: 'publication',
      targetId: publication.id,
    });
  }

  async moveToTrash(hash: string, author: User): Promise<void> {
    const statusTrash = await this._prisma.publicationStatus.findUnique({
      where: {
        type: 'archived',
      },
    });
    await this._prisma.publication.updateMany({
      where: {
        hash: hash,
        author: {
          id: author.id,
        },
      },
      data: {
        statusId: statusTrash.id,
      },
    });
    await this._prisma.user.update({
      where: {
        id: author.id,
      },
      data: {
        publicationsCount: {
          decrement: 1,
        },
      },
    });
  }

  async restore(hash: string, author: User): Promise<void> {
    const statusDraft = await this._prisma.publicationStatus.findUnique({
      where: {
        type: 'draft',
      },
    });
    await this._prisma.publication.updateMany({
      where: {
        hash: hash,
        author: {
          id: author.id,
        },
      },
      data: {
        statusId: statusDraft.id,
      },
    });
  }

  async bulkMoveToTrash(hashes: string[], author: User): Promise<void> {
    for (const hash of hashes) {
      await this.moveToTrash(hash, author);
    }
  }

  async bulkForceDelete(hashes: string[], author: User): Promise<void> {
    for (const hash of hashes) {
      await this.forceDelete(hash, author);
    }
  }

  async forceDelete(hash: string, author: User) {
    const publication = await this._prisma.publication.findFirst({
      where: {
        hash,
        author: { id: author.id },
      },
      select: { id: true },
    });

    if (!publication) {
      return;
    }

    await this._prisma.publication.delete({
      where: {
        id: publication.id,
      },
    });

    // Remove from feed (idempotent)
    await this.feed.onRemoved({
      targetType: 'publication',
      targetId: publication.id,
    });
  }
}
