import { v4 as uuidv4 } from 'uuid';

export interface TopicCreateProps {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  allowCustomPrice?: boolean;
  tutorialId?: string;
}

export class TopicEntity {
  public readonly id: string;
  public name: string;
  public description?: string;
  public slug: string;
  public logoUrl?: string;
  public readonly createdAt: Date;
  public updatedAt?: Date;
  public publicationsCount: number;
  public followersCount: number;
  public allowCustomPrice: boolean;
  public metaTitle?: string;
  public metaDescription?: string;
  public tutorialId?: string;

  get subscriptionType() {
    return 'topic';
  }

  private constructor(props: {
    id: string;
    name: string;
    description?: string;
    slug: string;
    logoUrl?: string;
    createdAt: Date;
    updatedAt?: Date;
    publicationsCount: number;
    followersCount: number;
    allowCustomPrice: boolean;
    metaTitle?: string;
    metaDescription?: string;
    tutorialId?: string;
  }) {
    this.id = props.id;
    this.name = props.name;
    this.description = props.description;
    this.slug = props.slug;
    this.logoUrl = props.logoUrl;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.publicationsCount = props.publicationsCount;
    this.followersCount = props.followersCount;
    this.allowCustomPrice = props.allowCustomPrice;
    this.metaTitle = props.metaTitle;
    this.metaDescription = props.metaDescription;
    this.tutorialId = props.tutorialId;
  }

  public static create(props: TopicCreateProps): TopicEntity {
    return new TopicEntity({
      id: uuidv4(),
      name: props.name,
      description: props.description,
      slug: props.slug,
      logoUrl: props.logoUrl,
      createdAt: new Date(),
      publicationsCount: 0,
      followersCount: 0,
      allowCustomPrice: props.allowCustomPrice ?? false,
      tutorialId: props.tutorialId,
    });
  }

  public static reconstitute(props: {
    id: string;
    name: string;
    description?: string | null;
    slug: string;
    logoUrl?: string | null;
    createdAt: Date;
    updatedAt?: Date | null;
    publicationsCount: number;
    followersCount: number;
    allowCustomPrice: boolean;
    metaTitle?: string | null;
    metaDescription?: string | null;
    tutorialId?: string | null;
  }): TopicEntity {
    return new TopicEntity({
      id: props.id,
      name: props.name,
      description: props.description ?? undefined,
      slug: props.slug,
      logoUrl: props.logoUrl ?? undefined,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt ?? undefined,
      publicationsCount: props.publicationsCount,
      followersCount: props.followersCount,
      allowCustomPrice: props.allowCustomPrice,
      metaTitle: props.metaTitle ?? undefined,
      metaDescription: props.metaDescription ?? undefined,
      tutorialId: props.tutorialId ?? undefined,
    });
  }

  public toPrimitives() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      slug: this.slug,
      logoUrl: this.logoUrl,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      publicationsCount: this.publicationsCount,
      followersCount: this.followersCount,
      allowCustomPrice: this.allowCustomPrice,
      metaTitle: this.metaTitle,
      metaDescription: this.metaDescription,
      tutorialId: this.tutorialId,
    };
  }
}
