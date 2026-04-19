export const FEED_REPOSITORY = 'FEED_REPOSITORY';

export type FeedTargetType = 'publication' | 'tutorial' | 'thread' | string;

export interface FeedRepositoryInterface {
  add(params: {
    feedType: string; // e.g., 'default'
    authorId: string;
    targetType: FeedTargetType;
    targetId: string;
    createdAt?: Date;
    pinned?: boolean;
  }): Promise<any>;

  hide(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void>;

  unhide(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void>;

  remove(params: {
    feedType: string;
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void>;

  list(params: {
    feedType: string;
    page?: number;
    pageSize?: number;
    userId?: string;
  }): Promise<Array<any>>; // presentation-layer projection

  /**
   * Synchronize FeedItem relations (authorId/channelId/topics/pinned) with the current state of the target.
   * Applies to all feeds that contain the specified target.
   */
  syncTarget(params: {
    targetType: FeedTargetType;
    targetId: string;
  }): Promise<void>;
}
