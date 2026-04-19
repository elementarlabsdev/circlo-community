import { Inject, Injectable } from '@nestjs/common';
import { BookmarksService } from './bookmarks.service';
import { PublicationsService } from '@/publications/application/services/publications.service';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';
import { ThreadsService } from '@/threads/application/services/threads.service';
import {
  BOOKMARK_REPOSITORY,
  BookmarkRepository,
} from '@/bookmarks/domain/repositories/bookmark-repository.interface';
import { SubscriptionsService } from '@/subscriptions/application/services/subscriptions.service';
import { TargetReactionsService } from '@/reactions/application/services/target-reactions.service';

@Injectable()
export class BookmarkListService {
  constructor(
    private _publicationService: PublicationsService,
    private _tutorialsService: TutorialsService,
    private _threadsService: ThreadsService,
    private _subscriptionsService: SubscriptionsService,
    private _bookmarksService: BookmarksService,
    private _targetReactionsService: TargetReactionsService,
    @Inject(BOOKMARK_REPOSITORY)
    private readonly repository: BookmarkRepository,
  ) {}

  async pagination(user: any, pageNumber: number, pageSize = 20) {
    // where is currently unused in repository abstraction; keeping signature for compatibility
    const bookmarks = await this.repository.findManyByUser(
      user.id,
      pageNumber,
      pageSize,
    );
    const totalItems = await this.repository.countByUser(user.id);
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    const items: any[] = [];
    const subscriptions: any[] = [];
    const loadedChannelsIds: string[] = [];
    const bookmarkList: any[] = [];
    const reactions: Record<string, any> = {};

    for (const bookmark of bookmarks) {
      if (bookmark.targetType === 'publication') {
        const publication =
          await this._publicationService.findOneByIdWithRelations(
            bookmark.targetId,
          );
        const publicationBookmark = await this._bookmarksService.get(
          user,
          publication.id,
          'publication',
        );
        reactions[publication.id] =
          await this._targetReactionsService.getReactions(
            publication.id,
            'publication',
            user,
          );

        if (publicationBookmark) {
          bookmarkList.push(publicationBookmark);
        }

        if (publication.channel) {
          if (!loadedChannelsIds.includes(publication.channel.id)) {
            const subscription = await this._subscriptionsService.get(
              user,
              publication.channel,
            );

            if (
              subscription &&
              !loadedChannelsIds.includes(publication.channel.id)
            ) {
              loadedChannelsIds.push(publication.channel.id);
              subscriptions.push(subscription);
            }
          }
        }

        items.push({
          bookmark,
          publication,
        });
      } else if (bookmark.targetType === 'tutorial') {
        const tutorial =
          await this._tutorialsService.findOneByIdWithRelations(
            bookmark.targetId,
          );

        const tutorialBookmark = await this._bookmarksService.get(
          user,
          tutorial.id,
          'tutorial',
        );

        reactions[tutorial.id] =
          await this._targetReactionsService.getReactions(
            tutorial.id,
            'tutorial',
            user,
          );

        if (tutorialBookmark) {
          bookmarkList.push(tutorialBookmark);
        }

        if (tutorial.channel) {
          if (!loadedChannelsIds.includes(tutorial.channel.id)) {
            const subscription = await this._subscriptionsService.get(
              user,
              tutorial.channel,
            );

            if (
              subscription &&
              !loadedChannelsIds.includes(tutorial.channel.id)
            ) {
              loadedChannelsIds.push(tutorial.channel.id);
              subscriptions.push(subscription);
            }
          }
        }

        items.push({
          bookmark,
          tutorial,
        });
      } else if (bookmark.targetType === 'thread') {
        const thread = await this._threadsService.findOneByIdWithRelations(
          bookmark.targetId,
        );

        const threadBookmark = await this._bookmarksService.get(
          user,
          thread.id,
          'thread',
        );

        reactions[thread.id] = await this._targetReactionsService.getReactions(
          thread.id,
          'thread',
          user,
        );

        if (threadBookmark) {
          bookmarkList.push(threadBookmark);
        }

        items.push({
          bookmark,
          thread: thread.toPrimitives(),
        });
      }
    }

    return {
      items,
      pagination,
      subscriptions,
      bookmarks: bookmarkList,
      reactions,
    };
  }
}
