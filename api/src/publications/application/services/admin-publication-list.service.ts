import { Injectable } from '@nestjs/common';
import { FeedService } from '@/feed/application/services/feed.service';
import { Publication } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class AdminPublicationListService {
  constructor(private _prisma: PrismaService, private readonly feed: FeedService) {}

  async findPaginatedPublished(
    pageSize: number,
    pageNumber: number,
    searchQuery = '',
    sortState = null,
  ) {
    const where = {};
    let orderBy: any = {
      publishedAt: 'desc',
    };

    if (searchQuery) {
      where['title'] = {
        contains: searchQuery,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Publication[] = await this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
        ...where,
      },
      orderBy: {
        ...orderBy,
      },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.publication.count({
      where: {
        status: {
          type: 'published',
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

  async unpublish(hash: string): Promise<void> {
    const publication = await this._prisma.publication.findFirst({
      where: {
        hash,
      },
      include: {
        author: true,
      },
    });

    if (!publication) {
      return;
    }

    const statusDraft = await this._prisma.publicationStatus.findUnique({
      where: {
        type: 'draft',
      },
    });

    await this._prisma.publication.updateMany({
      where: {
        hash: hash,
      },
      data: {
        statusId: statusDraft.id,
      },
    });

    await this._prisma.user.update({
      where: {
        id: publication.authorId,
      },
      data: {
        publicationsCount: {
          decrement: 1,
        },
      },
    });

    // Hide publication from feed (idempotent)
    await this.feed.onUnpublished({
      targetType: 'publication',
      targetId: publication.id,
    });
  }

  async bulkUnpublish(hashes: string[]): Promise<void> {
    for (const hash of hashes) {
      await this.unpublish(hash);
    }
  }

  async bulkDelete(hashes: string[]): Promise<void> {
    for (const hash of hashes) {
      await this.delete(hash);
    }
  }

  async delete(hash: string): Promise<void> {
    const publishedPublication = await this._prisma.publication.findFirst({
      where: {
        hash,
        status: {
          type: 'published',
        },
      },
      include: {
        channel: true,
        topics: true,
        author: true,
      },
    });

    if (publishedPublication) {
      for (const topic of publishedPublication.topics) {
        await this._prisma.topic.update({
          where: {
            id: topic.id,
          },
          data: {
            publicationsCount: topic.publicationsCount - 1,
          },
        });
      }

      if (publishedPublication.channel) {
        await this._prisma.channel.update({
          where: {
            id: publishedPublication.channel.id,
          },
          data: {
            publicationsCount: publishedPublication.channel.publicationsCount - 1,
          },
        });
      }

      await this._prisma.user.update({
        where: {
          id: publishedPublication.author.id,
        },
        data: {
          publicationsCount: publishedPublication.author.publicationsCount - 1,
        },
      });

      // Remove from feed (idempotent)
      await this.feed.onRemoved({
        targetType: 'publication',
        targetId: publishedPublication.id,
      });
    }

    await this._prisma.publication.delete({
      where: {
        hash,
      },
    });
  }
}
