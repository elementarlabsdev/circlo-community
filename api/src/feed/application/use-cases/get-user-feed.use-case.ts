import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { UsersService } from '@/identity/application/services/users.service';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';

@Injectable()
export class GetUserFeedUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly settings: SettingsService,
    private readonly users: UsersService,
    private readonly subscriptions: SubscriptionsService,
    private readonly enricher: FeedDataEnricher,
  ) {}

  async execute(params: {
    requestUser: any;
    username: string;
    pageNumber?: number;
  }) {
    const { requestUser, username, pageNumber = 1 } = params;

    const author = await this.users.findOneByUsername(username);
    const pageSize = +(await this.settings.findValueByName(
      'publicationsPerPage',
    ));
    const skip = (pageNumber - 1) * pageSize;

    // Fetch feed items by authorId from FeedItem
    const items = await this.prisma.feedItem.findMany({
      where: { authorId: author.id, hidden: false },
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip,
    });

    const enriched = await this.enricher.enrich(items, requestUser);

    // Also include subscription for the user itself (single check)
    const authorSubscription = await this.subscriptions.get(
      requestUser,
      author as any,
    );
    if (authorSubscription) {
      enriched.subscriptions.push(authorSubscription);
    }

    // Pagination based on FeedItem by authorId
    const totalItems = await this.prisma.feedItem.count({
      where: { authorId: author.id, hidden: false },
    });
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize) || 0,
      pageSize,
      pageNumber,
    };

    const donationLinks = await this.prisma.donationLink.findMany({
      where: { userId: author.id },
      orderBy: { position: 'asc' },
    });

    return {
      user: author.toPrimitives(),
      ...enriched,
      pagination,
      donationLinks,
    };
  }
}
