import { Injectable } from '@nestjs/common';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { BookmarksService } from '@/bookmarks/application/services/bookmarks.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class FeedDataEnricher {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly bookmarksService: BookmarksService,
    private readonly targetReactionsService: TargetReactionsService,
    private readonly prisma: PrismaService,
  ) {}

  async enrich(items: any[], user: any) {
    const threadIds = items
      .filter((it) => it.targetType === 'thread')
      .map((it) => it.targetId);
    const publicationIds = items
      .filter((it) => it.targetType === 'publication')
      .map((it) => it.targetId);
    const tutorialIds = items
      .filter((it) => it.targetType === 'tutorial')
      .map((it) => it.targetId);

    const threads = threadIds.length
      ? await this.prisma.thread.findMany({
          where: { id: { in: threadIds } },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
            mediaItems: true,
            respondingTo: true,
            poll: {
              include: {
                options: true,
              },
            },
          },
        })
      : [];

    const publications = publicationIds.length
      ? await this.prisma.publication.findMany({
          where: { id: { in: publicationIds } },
          include: {
            channel: true,
            topics: true,
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
            status: true,
          },
        })
      : [];

    const tutorials = tutorialIds.length
      ? await this.prisma.tutorial.findMany({
          where: { id: { in: tutorialIds } },
          include: {
            author: {
              select: {
                id: true,
                username: true,
                name: true,
                avatarUrl: true,
                email: true,
              },
            },
            topics: true,
            status: true,
            channel: true,
          },
        })
      : [];

    const finalItems = items.map((it: any) => {
      let target = null;
      if (it.targetType === 'thread') {
        target = threads.find((t) => t.id === it.targetId);
      } else if (it.targetType === 'publication') {
        target = publications.find((p) => p.id === it.targetId);
      } else if (it.targetType === 'tutorial') {
        target = tutorials.find((t) => t.id === it.targetId);
      }

      return { ...it, target, hasAccess: true };
    });

    const subscriptions: any[] = [];
    const loadedChannelsIds: string[] = [];
    const loadedUsersIds: string[] = [];
    const bookmarks: any[] = [];
    const reactions: Record<string, any> = {};

    for (const item of finalItems) {
      const target = item.target;
      if (!target) continue;

      if (
        (item.targetType === 'publication' || item.targetType === 'tutorial') &&
        target.channel
      ) {
        if (!loadedChannelsIds.includes(target.channel.id)) {
          const subscription = await this.subscriptionsService.get(
            user,
            target.channel,
          );
          if (subscription) {
            loadedChannelsIds.push(target.channel.id);
            subscriptions.push(subscription);
          }
        }
      }

      if (target.author && !loadedUsersIds.includes(target.author.id)) {
        const authorSubscription = await this.subscriptionsService.get(
          user,
          target.author,
        );
        if (authorSubscription) {
          loadedUsersIds.push(target.author.id);
          subscriptions.push(authorSubscription);
        }
      }

      const bookmark = await this.bookmarksService.get(
        user,
        target.id,
        item.targetType,
      );
      if (bookmark) {
        bookmarks.push(bookmark);
      }

      reactions[target.id] = await this.targetReactionsService.getReactions(
        item.targetId,
        item.targetType,
        user,
      );
    }

    return {
      items: finalItems,
      subscriptions,
      bookmarks,
      reactions,
    };
  }
}
