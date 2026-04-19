import { Inject, Injectable } from '@nestjs/common';
import {
  FEED_REPOSITORY,
  FeedRepositoryInterface,
  FeedTargetType,
} from '@/feed/domain/repositories/feed-repository.interface';
import { DefaultGateway } from '@/platform/infrastructure/default.gateway';
import { FeedDataEnricher } from '@/feed/application/services/feed-data-enricher.service';

@Injectable()
export class FeedService {
  constructor(
    @Inject(FEED_REPOSITORY)
    private readonly repo: FeedRepositoryInterface,
    private readonly gateway: DefaultGateway,
    private readonly enricher: FeedDataEnricher,
  ) {}

  async onPublished(params: {
    targetType: FeedTargetType;
    targetId: string;
    authorId: string;
    createdAt?: Date;
    pinned?: boolean;
    feedType?: string; // default
  }): Promise<void> {
    const {
      targetType,
      targetId,
      authorId,
      createdAt,
      pinned,
      feedType = 'default',
    } = params;
    const feedItem = await this.repo.add({
      feedType,
      authorId,
      targetType,
      targetId,
      createdAt,
      pinned,
    });

    const enriched = await this.enricher.enrich([feedItem], { id: authorId });
    const itemToSend = enriched.items[0];

    this.gateway.sendAddFeedItem(itemToSend);
  }

  async onUnpublished(params: {
    targetType: FeedTargetType;
    targetId: string;
    feedType?: string;
  }): Promise<void> {
    const { targetType, targetId, feedType = 'default' } = params;
    await this.repo.hide({ feedType, targetType, targetId });
  }

  async onRemoved(params: {
    targetType: FeedTargetType;
    targetId: string;
    feedType?: string;
  }): Promise<void> {
    const { targetType, targetId, feedType = 'default' } = params;
    await this.repo.remove({ feedType, targetType, targetId });
    this.gateway.sendRemoveFeedItem({ targetType, targetId });
  }

  async list(params: {
    feedType?: string;
    page?: number;
    pageSize?: number;
    userId?: string;
  }) {
    const { feedType = 'default', page, pageSize, userId } = params;
    return this.repo.list({ feedType, page, pageSize, userId });
  }

  /**
   * Synchronize FeedItem fields (author/channel/topics/pinned) when a target is updated.
   */
  async onUpdated(params: { targetType: FeedTargetType; targetId: string }) {
    const { targetType, targetId } = params;
    await this.repo.syncTarget({ targetType, targetId });
  }
}
