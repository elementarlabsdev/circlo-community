import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { User } from '@prisma/client';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';

@Injectable()
export class CommonPublicationListService {
  constructor(
    private _prisma: PrismaService,
    private _subscriptionsService: SubscriptionsService,
    private _bookmarksService: BookmarksService,
    private _publicationReactionsService: TargetReactionsService,
  ) {}

  async getLatest(
    user: User,
    pageNumber: number,
    pageSize = 20,
    where = {},
    query = '',
  ) {
    if (query.trim()) {
      where['textContent'] = {
        contains: query.trim(),
        mode: 'insensitive',
      };
    }

    const items = await this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
        ...where,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        channel: true,
        topics: true,
        author: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.publication.count({
      where: {
        status: {
          type: 'published',
        },
        ...where,
      },
    });
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    const subscriptions = [];
    const loadedChannelsIds = [];
    const loadedUsersIds = [];
    const bookmarks = [];
    const reactions = {};

    for (const item of items) {
      if (item.channel && !loadedChannelsIds.includes(item.channel.id)) {
        const subscription = await this._subscriptionsService.get(
          user,
          item.channel,
        );

        if (subscription) {
          loadedChannelsIds.push(item.channel.id);
          subscriptions.push(subscription);
        }
      }

      if (!loadedUsersIds.includes(item.author.id)) {
        const authorSubscription = await this._subscriptionsService.get(
          user,
          item.author,
        );

        if (authorSubscription) {
          loadedChannelsIds.push(item.author.id);
          subscriptions.push(authorSubscription);
        }
      }

      const bookmark = await this._bookmarksService.get(
        user,
        item.id,
        'publication',
      );

      if (bookmark) {
        bookmarks.push(bookmark);
      }

      reactions[item.id] = await this._publicationReactionsService.getReactions(
        item.id,
        'publication',
        user,
      );
    }

    return {
      items,
      pagination,
      subscriptions,
      bookmarks,
      reactions,
    };
  }

  async findMorePublicationsOfChannel(ignoredPublication: any, channel: any) {
    return this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
        channel: {
          id: channel.id,
        },
        id: {
          not: ignoredPublication.id,
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        channel: true,
        topics: true,
      },
      take: 3,
    });
  }

  async getSitemapPages(pageSize = 1000) {
    const totalItems = await this._prisma.publication.count({
      where: {
        status: {
          type: 'published',
        },
      },
    });
    return Math.ceil(totalItems / pageSize);
  }

  async getLatestForSitemap(pageNumber: number, pageSize = 1000) {
    return this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
      },
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        channel: true,
        topics: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
  }
}
