import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';

@Injectable()
export class GetTopicFeedUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly subscriptions: SubscriptionsService,
    private readonly enricher: FeedDataEnricher,
  ) {}

  async execute(params: { requestUser: any; slug: string; pageNumber?: number }) {
    const { requestUser, slug, pageNumber = 1 } = params;

    const topic = await this.prisma.topic.findUniqueOrThrow({
      where: { slug },
    });

    const pageSize = +(await this.settings.findValueByName('publicationsPerPage'));
    const skip = (pageNumber - 1) * pageSize;

    // Fetch feed items by topic via FeedItemTopic pivot
    const items = await this.prisma.feedItem.findMany({
      where: { hidden: false, topics: { some: { topicId: topic.id } } },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
    });

    const enriched = await this.enricher.enrich(items, requestUser);

    const totalItems = await this.prisma.feedItem.count({
      where: { hidden: false, topics: { some: { topicId: topic.id } } },
    });
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize) || 0,
      pageSize,
      pageNumber,
    };

    // Subscription to the topic itself
    const topicSubscription = await this.subscriptions.get(requestUser, topic as any);
    if (topicSubscription) {
      enriched.subscriptions.push(topicSubscription);
    }

    return {
      topic,
      ...enriched,
      pagination,
    };
  }
}
