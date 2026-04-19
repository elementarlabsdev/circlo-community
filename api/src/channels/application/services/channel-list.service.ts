import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class ChannelListService {
  constructor(
    private _prisma: PrismaService,
    private _subscriptionsService: SubscriptionsService,
  ) {}

  async getLatest(user: any, pageNumber: number, pageSize = 32) {
    const items = await this._prisma.channel.findMany({
      where: {
        visibility: {
          type: {
            in: ['public', 'private'],
          },
        },
      },
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
    const totalItems = await this._prisma.channel.count({});
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    const subscriptions = [];
    const loadedChannelsIds = [];

    for (const item of items) {
      if (loadedChannelsIds.includes(item.id)) {
        continue;
      }

      const subscription = await this._subscriptionsService.get(user, item);

      if (subscription) {
        loadedChannelsIds.push(item.id);
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
