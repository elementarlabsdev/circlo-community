import { Injectable } from '@nestjs/common';
import { FeedService } from '@/feed/application/services/feed.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';
import { RecommendationService } from '@/common/application/services/recommendation.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class GetFeedUseCase {
  constructor(
    private readonly feed: FeedService,
    private readonly prisma: PrismaService,
    private readonly enricher: FeedDataEnricher,
    private readonly recommendation: RecommendationService,
    private readonly settings: SettingsService,
  ) {}

  async execute(params: {
    user: any;
    type?: string;
    page?: number;
    pageSize?: number;
  }) {
    const { user, type = 'default', page = 1, pageSize = 20 } = params;

    const feedTypeSetting = await this.settings.findValueByName('feedType');
    const isSmart = feedTypeSetting === 'smart' && user?.id;
    const isStandard = feedTypeSetting === 'standard';

    let items: any[] = [];
    let totalItems: number = 0;

    if (isSmart) {
      const offset = (page - 1) * pageSize;
      items = await this.recommendation.getRecommendedFeed(
        user.id,
        pageSize,
        offset,
      );
      // For smart feed, we don't have an easy way to get totalItems without running the whole query.
      totalItems = await this.prisma.feedItem.count({
        where: { hidden: false },
      });
    }

    // Fallback to standard feed if smart feed returned no items (e.g., for new users)
    // or if smart feed was not requested.
    if (!isSmart || items.length === 0) {
      const listParams: any = {
        feedType: type,
        page,
        pageSize,
      };

      // If feedType is 'standard', we show items from everyone.
      // Otherwise (default or other types), we filter by followed users if userId is provided.
      if (user?.id && !isStandard) {
        listParams.userId = user.id;
      }

      items = await this.feed.list(listParams);

      const feed = await this.prisma.feed.findUnique({ where: { type } });
      if (feed) {
        const where: any = { feedId: feed.id, hidden: false };

        if (user?.id && !isStandard) {
          const followedUsers = await this.prisma.subscription.findMany({
            where: { followerId: user.id, targetType: 'user' },
            select: { targetId: true },
          });
          const followedUserIds = followedUsers.map((s) => s.targetId);
          followedUserIds.push(user.id);

          where.OR = [
            { authorId: { in: followedUserIds } },
            { targetType: 'thread' },
          ];
        }

        totalItems = await this.prisma.feedItem.count({
          where,
        });
      }
    }

    const enriched = await this.enricher.enrich(items, user);

    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber: page,
    };

    return {
      ...enriched,
      pagination,
    };
  }
}
