import { v4 as uuidv4 } from 'uuid';

export interface ChannelCreateProps {
  name: string;
  slug: string;
  description?: string;
  logoUrl?: string;
  ownerId?: string;
  visibilityId: string;
}

export class ChannelEntity {
  public readonly id: string;
  public name: string;
  public description?: string;
  public slug: string;
  public logoUrl?: string;
  public readonly createdAt: Date;
  public updatedAt?: Date;
  public publicationsCount: number;
  public followersCount: number;
  public ownerId?: string;
  public visibilityId: string;
  public metaTitle?: string;
  public metaDescription?: string;

  get subscriptionType() {
    return 'channel';
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
    ownerId?: string;
    visibilityId: string;
    metaTitle?: string;
    metaDescription?: string;
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
    this.ownerId = props.ownerId;
    this.visibilityId = props.visibilityId;
    this.metaTitle = props.metaTitle;
    this.metaDescription = props.metaDescription;
  }

  public static create(props: ChannelCreateProps): ChannelEntity {
    return new ChannelEntity({
      id: uuidv4(),
      name: props.name,
      description: props.description,
      slug: props.slug,
      logoUrl: props.logoUrl,
      createdAt: new Date(),
      publicationsCount: 0,
      followersCount: 0,
      ownerId: props.ownerId,
      visibilityId: props.visibilityId,
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
    ownerId?: string | null;
    visibilityId: string;
    metaTitle?: string | null;
    metaDescription?: string | null;
  }): ChannelEntity {
    return new ChannelEntity({
      id: props.id,
      name: props.name,
      description: props.description ?? undefined,
      slug: props.slug,
      logoUrl: props.logoUrl ?? undefined,
      createdAt: props.createdAt,
      updatedAt: props.updatedAt ?? undefined,
      publicationsCount: props.publicationsCount,
      followersCount: props.followersCount,
      ownerId: props.ownerId ?? undefined,
      visibilityId: props.visibilityId,
      metaTitle: props.metaTitle ?? undefined,
      metaDescription: props.metaDescription ?? undefined,
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
      ownerId: this.ownerId,
      visibilityId: this.visibilityId,
      metaTitle: this.metaTitle,
      metaDescription: this.metaDescription,
    };
  }
}
