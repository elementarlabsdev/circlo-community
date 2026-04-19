import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';

@Injectable()
export class GetChannelFeedUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly subscriptions: SubscriptionsService,
    private readonly enricher: FeedDataEnricher,
  ) {}

  async execute(params: {
    requestUser: any;
    slug: string;
    pageNumber?: number;
  }) {
    const { requestUser, slug, pageNumber = 1 } = params;

    const channel = (await this.prisma.channel.findUniqueOrThrow({
      where: { slug },
      include: {
        rules: true,
        moderators: true,
        visibility: true,
      },
    })) as any;

    const channelSubscription = await this.subscriptions.get(
      requestUser,
      channel as any,
    );

    let hasAccess = true;
    if (channel.visibility?.type === 'private') {
      hasAccess = channelSubscription?.isFollowing || false;
    } else if (channel.accessType === 'subscribers') {
      hasAccess = channelSubscription?.isFollowing || false;
    }

    const pageSize = +(await this.settings.findValueByName(
      'publicationsPerPage',
    ));
    const skip = (pageNumber - 1) * pageSize;

    let items = [];
    let totalItems = 0;

    // Fetch feed items by channelId from FeedItem
    items = await this.prisma.feedItem.findMany({
      where: { channelId: channel.id, hidden: false },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
    });

    totalItems = await this.prisma.feedItem.count({
      where: { channelId: channel.id, hidden: false },
    });

    const enriched = await this.enricher.enrich(items, requestUser);

    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize) || 0,
      pageSize,
      pageNumber,
    };

    if (channelSubscription) {
      enriched.subscriptions.push(channelSubscription);
    }

    return {
      channel,
      ...enriched,
      pagination,
      hasAccess,
    };
  }
}
