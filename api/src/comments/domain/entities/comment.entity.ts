export type CommentPrimitives = {
  id: string;
  htmlContent: string;
  textContent: string;
  depth: number;
  createdAt: Date;
  repliesCount: number;
  reactionsCount: number;
  isHidden: boolean;
  authorId: string;
  publicationId?: string | null;
  lessonId?: string | null;
  respondingToId?: string | null;
  // Optionally include lightweight author/publication projections used by presenters
  author?: any;
  publication?: any;
  lesson?: any;
  respondingTo?: any;
};

// Domain Entity (Aggregate: Comment)
export class Comment {
  private constructor(private readonly props: CommentPrimitives) {
    if (!props.id) throw new Error('Comment.id is required');
    if (props.depth == null || props.depth < 0)
      throw new Error('Comment.depth must be >= 0');
    if (!props.htmlContent || props.htmlContent.trim().length === 0)
      throw new Error('Comment.htmlContent is required');
    if (props.textContent == null)
      throw new Error('Comment.textContent is required');
    if (!props.authorId) throw new Error('Comment.authorId is required');
    // either publicationId or lessonId must be provided
    if (!props.publicationId && !props.lessonId)
      throw new Error('Comment.publicationId or Comment.lessonId is required');
    if (!props.createdAt) this.props.createdAt = new Date();
    // repliesCount can be 0
    if (this.props.repliesCount == null) this.props.repliesCount = 0;
    if (this.props.reactionsCount == null) this.props.reactionsCount = 0;
    if (this.props.isHidden == null) this.props.isHidden = false;
  }

  static create(attrs: CommentPrimitives): Comment {
    return new Comment({ ...attrs });
  }

  static fromPersistence(row: any): Comment {
    return new Comment({
      id: row.id,
      htmlContent: row.htmlContent,
      textContent: row.textContent ?? '',
      depth: row.depth ?? 0,
      createdAt: row.createdAt ? new Date(row.createdAt) : new Date(),
      repliesCount: row.repliesCount ?? 0,
      reactionsCount: row.reactionsCount ?? 0,
      isHidden: !!row.isHidden,
      authorId: row.authorId ?? row.author?.id,
      publicationId: row.publicationId ?? row.publication?.id ?? null,
      lessonId: row.lessonId ?? row.lesson?.id ?? null,
      respondingToId: row.respondingToId ?? row.respondingTo?.id ?? null,
      author: row.author,
      publication: row.publication,
      lesson: row.lesson,
      respondingTo: row.respondingTo,
    });
  }

  toPrimitives(): CommentPrimitives {
    return { ...this.props };
  }

  // Getters
  get id() {
    return this.props.id;
  }
  get htmlContent() {
    return this.props.htmlContent;
  }
  get textContent() {
    return this.props.textContent;
  }
  get depth() {
    return this.props.depth;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get repliesCount() {
    return this.props.repliesCount;
  }
  get reactionsCount() {
    return this.props.reactionsCount;
  }
  get isHidden() {
    return this.props.isHidden;
  }
  get authorId() {
    return this.props.authorId;
  }
  get publicationId() {
    return this.props.publicationId ?? null;
  }
  get respondingToId() {
    return this.props.respondingToId ?? null;
  }
  get lessonId() {
    return this.props.lessonId ?? null;
  }

  hide() {
    this.props.isHidden = true;
  }
  unhide() {
    this.props.isHidden = false;
  }

  // Optional projections (used by presentation layer today)
  get author() {
    return this.props.author;
  }
  get publication() {
    return this.props.publication;
  }
  get lesson() {
    return this.props.lesson;
  }
  get respondingTo() {
    return this.props.respondingTo;
  }
}
