export type ThreadPrimitives = {
  id: string;
  textContent: string;
  htmlContent?: string | null;
  depth: number;
  level: number;
  createdAt: Date;
  scheduleAt?: Date | null;
  reactionsCount: number;
  repliesCount: number;
  qualityScore?: any | null;
  authorId: string;
  respondingToId?: string | null;
  mainThreadId?: string | null;
  statusId: string; // required
  isHidden: boolean;
  location?: any | null;
  // Optional lightweight projections (presentation layer convenience)
  author?: any;
  respondingTo?: any;
  mainThread?: any;
  status?: any;
  children?: any[];
  poll?: any;
  mediaItems?: any[];
};

// Domain Entity (Aggregate Root): Thread
export class Thread {
  private constructor(private readonly props: ThreadPrimitives) {
    if (!props.id) throw new Error('Thread.id is required');
    if (!props.authorId) throw new Error('Thread.authorId is required');
    if ((!props.textContent || props.textContent.trim().length === 0) && (!props.mediaItems || props.mediaItems.length === 0))
      throw new Error('Thread textContent or mediaItems is required');
    if (props.depth == null || props.depth < 0)
      throw new Error('Thread.depth must be >= 0');
    if (props.level == null || props.level < 0)
      throw new Error('Thread.level must be >= 0');
    if (!props.createdAt) this.props.createdAt = new Date();
    if (this.props.reactionsCount == null) this.props.reactionsCount = 0;
    if (this.props.repliesCount == null) this.props.repliesCount = 0;
    if (!props.statusId) throw new Error('Thread.statusId is required');
  }

  static create(attrs: ThreadPrimitives): Thread {
    return new Thread({ ...attrs });
  }

  static fromPersistence(row: any): Thread {
    return new Thread({
      id: row.id,
      textContent: row.textContent,
      htmlContent: row.htmlContent,
      depth: row.depth ?? 0,
      level: row.level ?? 0,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      scheduleAt: row.scheduleAt ? new Date(row.scheduleAt) : null,
      reactionsCount: row.reactionsCount ?? 0,
      repliesCount: row.repliesCount ?? 0,
      qualityScore: row.qualityScore,
      authorId: row.authorId ?? row.author?.id,
      respondingToId: row.respondingToId ?? row.respondingTo?.id ?? null,
      mainThreadId: row.mainThreadId ?? row.mainThread?.id ?? null,
      statusId: (row.statusId ?? row.status?.id) as string,
      isHidden: !!row.isHidden,
      location: row.location,
      author: row.author,
      respondingTo: row.respondingTo,
      mainThread: row.mainThread,
      status: row.status,
      children: row.children,
      poll: row.poll,
      mediaItems: row.mediaItems,
    });
  }

  toPrimitives(): ThreadPrimitives {
    return { ...this.props };
  }

  // Getters
  get id() {
    return this.props.id;
  }
  get textContent() {
    return this.props.textContent;
  }
  get htmlContent() {
    return this.props.htmlContent;
  }
  get depth() {
    return this.props.depth;
  }
  get level() {
    return this.props.level;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get scheduleAt() {
    return this.props.scheduleAt;
  }
  get location() {
    return this.props.location;
  }
  get poll() {
    return this.props.poll;
  }
  get reactionsCount() {
    return this.props.reactionsCount;
  }
  get repliesCount() {
    return this.props.repliesCount;
  }
  get qualityScore() {
    return this.props.qualityScore;
  }
  get authorId() {
    return this.props.authorId;
  }
  get respondingToId() {
    return this.props.respondingToId ?? null;
  }
  get mainThreadId() {
    return this.props.mainThreadId ?? null;
  }
  get statusId() {
    return this.props.statusId;
  }

  get mediaItems(): any[] | undefined {
    return this.props.mediaItems;
  }

  get author() {
    return this.props.author;
  }
  get status() {
    return this.props.status;
  }
  get children() {
    return this.props.children;
  }
  get respondingTo() {
    return this.props.respondingTo;
  }
  get mainThread() {
    return this.props.mainThread;
  }
  get isHidden() {
    return this.props.isHidden;
  }

  // Domain behaviors
  incrementReplies() {
    this.props.repliesCount = (this.props.repliesCount ?? 0) + 1;
  }
  decrementReplies() {
    this.props.repliesCount = Math.max(0, (this.props.repliesCount ?? 0) - 1);
  }
}
