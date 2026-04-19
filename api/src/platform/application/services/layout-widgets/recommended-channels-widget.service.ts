import { Injectable } from '@nestjs/common';
import { User, LayoutWidgetDef } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';

@Injectable()
export class RecommendedChannelsWidgetService {
  constructor(
    private _prima: PrismaService,
    private _subscriptionsService: SubscriptionsService,
  ) {}

  async getData(widget: LayoutWidgetDef, user: User) {
    const channelIds = await this._prima
      .random()
      .channel.findManyRandom(widget.settings['limit'], {});
    const channels = await this._prima.channel.findMany({
      where: {
        id: {
          in: channelIds.map((r) => r.id),
        },
      },
    });

    const subscriptions = [];

    for (const channel of channels) {
      const subscription = await this._subscriptionsService.get(user, channel);

      if (subscription) {
        subscriptions.push(subscription);
      }
    }

    return {
      channels,
      subscriptions,
    };
  }
}
