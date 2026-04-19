import { v4 as uuidv4 } from 'uuid';
import { IOwnable } from '../../../common/domain/interfaces/ownable.interface';

export type TutorialStatusType = 'draft' | 'inReview' | 'published' | 'archived';

export interface TutorialCreateProps {
  title: string;
  description?: string;
  authorId: string;
  featuredImageUrl?: string | null;
  channelId?: string | null;
}

export class Tutorial implements IOwnable {
  public readonly id: string;
  public title: string;
  public description?: string;
  public authorId: string;
  public featuredImageUrl?: string | null;
  public channelId?: string | null;
  public lessonsCount: number;
  public status: TutorialStatusType;
  public readonly createdAt: Date;
  public updatedAt?: Date;
  public publishedAt?: Date;

  private constructor(props: {
    id: string;
    title: string;
    description?: string;
    authorId: string;
    featuredImageUrl?: string | null;
    channelId?: string | null;
    lessonsCount: number;
    status: TutorialStatusType;
    createdAt: Date;
    updatedAt?: Date;
    publishedAt?: Date;
  }) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.authorId = props.authorId;
    this.featuredImageUrl = props.featuredImageUrl ?? null;
    this.channelId = props.channelId ?? null;
    this.lessonsCount = props.lessonsCount;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.publishedAt = props.publishedAt;
  }

  public static create(props: TutorialCreateProps): Tutorial {
    return new Tutorial({
      id: uuidv4(),
      title: props.title,
      description: props.description ?? null,
      authorId: props.authorId,
      featuredImageUrl: props.featuredImageUrl ?? null,
      channelId: props.channelId ?? null,
      lessonsCount: 0,
      status: 'draft',
      createdAt: new Date(),
    });
  }

  public static reconstitute(props: {
    id: string;
    title: string;
    description?: string | null;
    authorId: string;
    featuredImageUrl?: string | null;
    channelId?: string | null;
    lessonsCount: number;
    status: TutorialStatusType;
    createdAt: Date;
    updatedAt?: Date | null;
    publishedAt?: Date | null;
  }): Tutorial {
    return new Tutorial({
      id: props.id,
      title: props.title,
      description: props.description ?? undefined,
      authorId: props.authorId,
      featuredImageUrl: props.featuredImageUrl ?? null,
      lessonsCount: props.lessonsCount,
      status: props.status,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt ?? undefined,
      publishedAt: props.publishedAt ?? undefined,
    });
  }

  public toPrimitives() {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      authorId: this.authorId,
      featuredImageUrl: this.featuredImageUrl,
      channelId: this.channelId ?? null,
      lessonsCount: this.lessonsCount,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      publishedAt: this.publishedAt,
    };
  }
}
