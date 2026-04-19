export interface MediaStarProps {
  id: string;
  userId: string;
  mediaItemId: string;
}

export class MediaStarEntity {
  public readonly id: string;
  public readonly userId: string;
  public readonly mediaItemId: string;

  private constructor(props: MediaStarProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.mediaItemId = props.mediaItemId;
  }

  static reconstitute(props: MediaStarProps): MediaStarEntity {
    return new MediaStarEntity(props);
  }

  toPrimitives(): MediaStarProps {
    return {
      id: this.id,
      userId: this.userId,
      mediaItemId: this.mediaItemId,
    };
  }
}
