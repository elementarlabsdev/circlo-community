import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class TopicListService {
  constructor(
    private _prisma: PrismaService,
    private _subscriptionsService: SubscriptionsService,
  ) {}

  async getLatest(user: User, pageNumber: number, pageSize = 32) {
    const items = await this._prisma.topic.findMany({
      orderBy: [
        {
          publicationsCount: 'desc',
        },
        {
          followersCount: 'desc',
        },
      ],
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.topic.count({});
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    const subscriptions = [];
    const loadedTopicsIds = [];

    for (const item of items) {
      if (loadedTopicsIds.includes(item.id)) {
        continue;
      }

      const subscription = await this._subscriptionsService.get(user, item);

      if (subscription) {
        loadedTopicsIds.push(item.id);
        subscriptions.push(subscription);
      }
    }

    return {
      items,
      pagination,
      subscriptions,
    };
  }
}
