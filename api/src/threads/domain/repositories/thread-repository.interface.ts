export const THREAD_REPOSITORY = 'THREAD_REPOSITORY';

import { Thread } from '../entities/thread.entity';

export interface ThreadRepositoryInterface {
  findByIdOrFail(id: string): Promise<Thread>;
  findChildren(parentId: string): Promise<Thread[]>;
  listByAuthor(authorId: string): Promise<Thread[]>;
  createRoot(authorId: string, textContent: string, mediaItemIds?: string[]): Promise<Thread>;
  reply(parent: Thread, authorId: string, textContent: string): Promise<Thread>;
  deleteById(id: string): Promise<void>;
  updateRepliesCount(threadId: string, delta: number): Promise<void>;
}
