export type FeedItemPrimitives = {
  id: string;
  feedId: string;
  authorId: string;
  targetType: 'publication' | 'tutorial' | 'thread' | string;
  targetId: string;
  createdAt: Date;
  pinned: boolean;
  hidden: boolean;
};

export class FeedItem {
  private constructor(private readonly props: FeedItemPrimitives) {
    if (!props.id) throw new Error('FeedItem.id is required');
    if (!props.feedId) throw new Error('FeedItem.feedId is required');
    if (!props.authorId) throw new Error('FeedItem.authorId is required');
    if (!props.targetType) throw new Error('FeedItem.targetType is required');
    if (!props.targetId) throw new Error('FeedItem.targetId is required');
    if (!props.createdAt) this.props.createdAt = new Date();
    if (typeof props.pinned !== 'boolean') this.props.pinned = false;
    if (typeof props.hidden !== 'boolean') this.props.hidden = false;
  }

  static create(attrs: FeedItemPrimitives): FeedItem {
    return new FeedItem({ ...attrs });
  }

  static fromPersistence(row: any): FeedItem {
    return new FeedItem({
      id: row.id,
      feedId: row.feedId,
      authorId: row.authorId ?? row.author?.id,
      targetType: row.targetType,
      targetId: row.targetId,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      pinned: !!row.pinned,
      hidden: !!row.hidden,
    });
  }

  toPrimitives(): FeedItemPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }
  get feedId() {
    return this.props.feedId;
  }
  get authorId() {
    return this.props.authorId;
  }
  get targetType() {
    return this.props.targetType;
  }
  get targetId() {
    return this.props.targetId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get pinned() {
    return this.props.pinned;
  }
  get hidden() {
    return this.props.hidden;
  }
}
