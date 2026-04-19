import { Inject, Injectable } from '@nestjs/common';
import {
  THREAD_REPOSITORY,
  ThreadRepositoryInterface,
} from '../../domain/repositories/thread-repository.interface';
import { Thread } from '../../domain/entities/thread.entity';
import { FeedService } from '@/feed/application/services/feed.service';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { UsersService } from '@/identity/application/services/users.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';
import { TextQualityQueue } from '@/text-quality/text-quality.queue';

@Injectable()
export class ThreadsService {
  constructor(
    @Inject(THREAD_REPOSITORY)
    private readonly repository: ThreadRepositoryInterface,
    private readonly feed: FeedService,
    private readonly fileStorage: FileStorageService,
    private readonly notifications: NotificationsManagerService,
    private readonly users: UsersService,
    private readonly textQualityQueue: TextQualityQueue,
  ) {}

  // Create a root thread (no parent)
  async createRoot(
    authorId: string,
    content: string,
    mediaItemIds?: string[],
  ): Promise<Thread> {
    if (!authorId) throw new Error('AuthorId is required');
    const textContent = content?.trim() || '';
    if (
      textContent.length === 0 &&
      (!mediaItemIds || mediaItemIds.length === 0)
    )
      throw new Error('Content or Media Items is required');
    const thread = await this.repository.createRoot(
      authorId,
      textContent,
      mediaItemIds,
    );
    // Add only root threads to feed (replies usually excluded)
    if (!thread.respondingToId) {
      await this.feed.onPublished({
        targetType: 'thread',
        targetId: thread.id,
        authorId: thread.authorId,
        createdAt: thread.createdAt,
      });
    }

    await this.textQualityQueue.analyzeThread(thread.id);

    return thread;
  }

  // Reply to existing thread
  async reply(
    authorId: string,
    parentId: string,
    content: string,
  ): Promise<Thread> {
    if (!authorId) throw new Error('authorId is required');
    if (!parentId) throw new Error('parentId is required');
    if (!content || content.trim().length === 0)
      throw new Error('textContent is required');

    const parent = await this.repository.findByIdOrFail(parentId);
    const thread = await this.repository.reply(
      parent,
      authorId,
      content.trim(),
    );

    const actor = await this.users.findOneById(authorId);

    await this.notifications.createOrUpdateNotification({
      userId: parent.authorId,
      type: NotificationType.THREAD_REPLY,
      actor: {
        id: actor.id,
        name: actor.name,
        username: actor.username,
        avatarUrl: (actor as any).avatarUrl,
      },
      entity: {
        ...parent.toPrimitives(),
        type: 'thread',
      },
    });

    await this.textQualityQueue.analyzeThread(thread.id);

    return thread;
  }

  async getThread(id: string): Promise<Thread> {
    return this.repository.findByIdOrFail(id);
  }

  async exists(id: string): Promise<boolean> {
    try {
      await this.repository.findByIdOrFail(id);
      return true;
    } catch (e) {
      return false;
    }
  }

  async findOneByIdWithRelations(id: string): Promise<Thread> {
    return this.repository.findByIdOrFail(id);
  }

  async listChildren(parentId: string): Promise<Thread[]> {
    return this.repository.findChildren(parentId);
  }

  async listByAuthor(authorId: string): Promise<Thread[]> {
    return this.repository.listByAuthor(authorId);
  }

  async deleteThread(id: string): Promise<void> {
    const thread = await this.repository.findByIdOrFail(id);

    // 1. Delete media items and physical files
    if (thread.mediaItems && thread.mediaItems.length > 0) {
      for (const mediaItem of thread.mediaItems) {
        await this.fileStorage.delete(mediaItem.id);
      }
    }

    // 2. Delete the thread itself from database
    await this.repository.deleteById(id);

    // 3. Remove from feed if it exists (idempotent)
    await this.feed.onRemoved({ targetType: 'thread', targetId: id });
  }
}
