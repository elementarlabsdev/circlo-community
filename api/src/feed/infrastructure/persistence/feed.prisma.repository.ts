import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import {
  FeedRepositoryInterface,
  FeedTargetType,
} from '@/feed/domain/repositories/feed-repository.interface';

@Injectable()
export class FeedPrismaRepository implements FeedRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private async getFeedIdByType(feedType: string): Promise<string> {
    const feed = await this.prisma.feed.findUnique({
      where: { type: feedType },
    });
    if (!feed) throw new Error(`Feed with type=${feedType} not found`);
    return feed.id;
  }

  async add(params: {
    feedType: string;
    authorId: string;
    targetType: FeedTargetType;
    targetId: string;
    createdAt?: Date | undefined;
    pinned?: boolean | undefined;
  }): Promise<any> {
    const { feedType, authorId, targetType, targetId, createdAt, pinned } =
      params;
    const feedId = await this.getFeedIdByType(feedType);

    // Derive channel and topics from target (same sync pattern as author)
    let channelId: string | null = null;
    let topicIds: string[] = [];
    if (targetType === 'publication') {
      const pub = await this.prisma.publication.findFirst({
        where: { id: targetId, status: { type: 'published' } },
        select: { channelId: true, topics: { select: { id: true } } },
      });
      channelId = pub?.channelId ?? null;
      topicIds = pub?.topics?.map((t) => t.id) ?? [];
    } else if (targetType === 'tutorial') {
      const tut = await this.prisma.tutorial.findFirst({
        where: { id: targetId, status: { type: 'published' } },
        select: { channelId: true, topics: { select: { id: true } } },
      });
      channelId = tut?.channelId ?? null;
      topicIds = tut?.topics?.map((t) => t.id) ?? [];
    } else {
      // threads and others: no channel/topics
      channelId = null;
      topicIds = [];
    }
    // Idempotent via unique constraint
    const createdOrUpdated = await this.prisma.feedItem.upsert({
      where: {
        feedId_targetType_targetId: { feedId, targetType, targetId },
      },
      create: {
        feedId,
        authorId,
        targetType,
        targetId,
        createdAt: createdAt ?? new Date(),
        pinned: !!pinned,
        hidden: false,
        channelId: channelId ?? undefined,
      },
      update: {
        // In case it existed but was hidden, we unhide on publish
        hidden: false,
        // Optionally update createdAt/pinned
        ...(createdAt ? { createdAt } : {}),
        ...(pinned != null ? { pinned: !!pinned } : {}),
        // Keep channel in sync with target
        channelId: channelId ?? null,
      },
      include: {
        author: true,
        channel: true,
      },
    });

    // Synchronize topics relation (clear and set to target's topics)
    try {
      // Remove existing bindings for this feed item
      await this.prisma.feedItemTopic.deleteMany({
        where: { feedItemId: createdOrUpdated.id },
      });
      if (topicIds.length) {
        await this.prisma.feedItemTopic.createMany({
          data: topicIds.map((tid) => ({
            feedItemId: createdOrUpdated.id,
            topicId: tid,
          })),
          skipDuplicates: true,
        });
      }
    } catch (e) {
      // Non-fatal: topic sync issues shouldn't block feed item creation
      // You might want to add logging here in the future
    }
    const finalItem = await this.prisma.feedItem.findUnique({
      where: { id: createdOrUpdated.id },
      include: {
        author: true,
        channel: true,
        topics: {
          include: {
            topic: true,
          },
        },
      },
    });
    return finalItem;
  }

  async syncTarget(params: {
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void> {
    const { targetType, targetId } = params;

    // Only thread, publication and tutorial have data to sync
    if (
      targetType !== 'thread' &&
      targetType !== 'publication' &&
      targetType !== 'tutorial'
    )
      return;

    // Load current state from the target
    let authorId: string | null = null;
    let channelId: string | null = null;
    let pinned: boolean | null = null;
    let topicIds: string[] = [];

    if (targetType === 'thread') {
      const thread = await this.prisma.thread.findUnique({
        where: { id: targetId },
        select: {
          authorId: true,
        },
      });
      if (!thread) return;
      authorId = thread.authorId;
    } else if (targetType === 'publication') {
      const pub = await this.prisma.publication.findFirst({
        where: { id: targetId, status: { type: 'published' } },
        select: {
          authorId: true,
          channelId: true,
          pinned: true,
          topics: { select: { id: true } },
        },
      });
      if (!pub) return;
      authorId = pub.authorId;
      channelId = pub.channelId ?? null;
      pinned = pub.pinned;
      topicIds = pub.topics?.map((t) => t.id) ?? [];
    } else if (targetType === 'tutorial') {
      const tut = await this.prisma.tutorial.findFirst({
        where: { id: targetId, status: { type: 'published' } },
        select: {
          authorId: true,
          channelId: true,
          pinned: true,
          topics: { select: { id: true } },
        },
      });
      if (!tut) return;
      authorId = tut.authorId;
      channelId = tut.channelId ?? null;
      pinned = tut.pinned as any;
      topicIds = tut.topics?.map((t) => t.id) ?? [];
    }

    // Update FeedItem rows for this target across all feeds
    await this.prisma.feedItem.updateMany({
      where: { targetType, targetId },
      data: {
        ...(authorId ? { authorId } : {}),
        channelId: channelId ?? null,
        ...(typeof pinned === 'boolean' ? { pinned } : {}),
      },
    });

    // Refresh topics bindings for all feed items of this target
    try {
      const feedItems = await this.prisma.feedItem.findMany({
        where: { targetType, targetId },
        select: { id: true },
      });
      const ids = feedItems.map((fi) => fi.id);
      if (!ids.length) return;

      // Clear existing
      await this.prisma.feedItemTopic.deleteMany({
        where: { feedItemId: { in: ids } },
      });

      if (topicIds.length) {
        // Recreate bindings for each feed item id
        const data = ids.flatMap((fid) =>
          topicIds.map((tid) => ({ feedItemId: fid, topicId: tid })),
        );
        // Chunk if too large? For now assume manageable size
        await this.prisma.feedItemTopic.createMany({
          data,
          skipDuplicates: true,
        });
      }
    } catch (e) {
      // Non-fatal; consider logging
    }
  }

  async hide(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void> {
    const { feedType, targetType, targetId } = params;
    const feedId = await this.getFeedIdByType(feedType);
    await this.prisma.feedItem.updateMany({
      where: { feedId, targetType, targetId },
      data: { hidden: true },
    });
  }

  async unhide(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void> {
    const { feedType, targetType, targetId } = params;
    const feedId = await this.getFeedIdByType(feedType);
    await this.prisma.feedItem.updateMany({
      where: { feedId, targetType, targetId },
      data: { hidden: false },
    });
  }

  async remove(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void> {
    const { feedType, targetType, targetId } = params;
    const feedId = await this.getFeedIdByType(feedType);
    await this.prisma.feedItem.deleteMany({
      where: { feedId, targetType, targetId },
    });
  }

  async list(params: {
    feedType: string;
    page?: number;
    pageSize?: number;
    userId?: string;
  }): Promise<any[]> {
    const { feedType, page = 1, pageSize = 20, userId } = params;
    const feedId = await this.getFeedIdByType(feedType);

    const where: any = { feedId, hidden: false };

    if (userId) {
      const followedUsers = await this.prisma.subscription.findMany({
        where: { followerId: userId, targetType: 'user' },
        select: { targetId: true },
      });
      const followedUserIds = followedUsers.map((s) => s.targetId);
      followedUserIds.push(userId);

      where.OR = [
        { authorId: { in: followedUserIds } },
        { targetType: 'thread' },
      ];
    }

    return this.prisma.feedItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: pageSize,
      skip: (page - 1) * pageSize,
    });
  }
}
