export type BookmarkTargetType = 'publication';

export class BookmarkEntity {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly targetType: BookmarkTargetType,
    public readonly targetId: string,
    public readonly createdAt?: Date,
  ) {}
}
