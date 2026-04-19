import { IOwnable } from '../../../common/domain/interfaces/ownable.interface';

export type PublicationPrimitives = {
  id: string;
  title: string;
  slug: string | null;
  hash: string;
  textContent: string;
  blocksContent: unknown[];
  authorId: string;
  channelId: string | null;
  statusId: string;
  typeId: string;
  licenseTypeId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  canonicalUrl: string | null;
  readingTime: number;
  viewsCount: number;
  pinned: boolean;
  discussionEnabled: boolean;
  createdAt: Date;
  updatedAt: Date | null;
  publishedAt: Date | null;
};

export class Publication implements IOwnable {
  private constructor(private props: PublicationPrimitives) {}

  get authorId() {
    return this.props.authorId;
  }

  // Factory for creating new domain entity (aggregate root)
  static create(
    props: Omit<
      PublicationPrimitives,
      'id' | 'createdAt' | 'updatedAt' | 'viewsCount' | 'slug'
    > & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date | null;
      viewsCount?: number;
      slug?: string | null;
    },
  ): Publication {
    const now = props.createdAt ?? new Date();
    const entity: PublicationPrimitives = {
      id: props.id ?? crypto.randomUUID(),
      title: props.title,
      slug: props.slug ?? null,
      hash: props.hash,
      textContent: props.textContent,
      blocksContent: props.blocksContent ?? [],
      authorId: props.authorId,
      channelId: props.channelId ?? null,
      statusId: props.statusId,
      typeId: props.typeId,
      licenseTypeId: props.licenseTypeId,
      metaTitle: props.metaTitle ?? null,
      metaDescription: props.metaDescription ?? null,
      canonicalUrl: props.canonicalUrl ?? null,
      readingTime: props.readingTime ?? 0,
      viewsCount: props.viewsCount ?? 0,
      pinned: !!props.pinned,
      discussionEnabled: !!props.discussionEnabled,
      createdAt: now,
      updatedAt: props.updatedAt ?? null,
      publishedAt: props.publishedAt ?? null,
    };
    return new Publication(entity);
  }

  // Reconstitute from persistence
  static reconstitute(model: any): Publication {
    const draft = model.drafts?.[0]?.draft as any;
    const entity: PublicationPrimitives = {
      id: model.id,
      title: draft?.title ?? model.title,
      slug: draft?.slug ?? model.slug ?? null,
      hash: model.hash,
      textContent: draft?.textContent ?? model.textContent ?? '',
      blocksContent: draft?.blocksContent ?? model.blocksContent ?? [],
      authorId: model.authorId,
      channelId: draft?.channelId ?? model.channelId ?? null,
      statusId: model.statusId,
      typeId: model.typeId,
      licenseTypeId: draft?.licenseTypeId ?? model.licenseTypeId,
      metaTitle: draft?.metaTitle ?? model.metaTitle ?? null,
      metaDescription: draft?.metaDescription ?? model.metaDescription ?? null,
      canonicalUrl: draft?.canonicalUrl ?? model.canonicalUrl ?? null,
      readingTime: model.readingTime ?? 0,
      viewsCount: model.viewsCount ?? 0,
      pinned: draft?.pinned !== undefined ? !!draft.pinned : !!model.pinned,
      discussionEnabled: draft?.discussionEnabled !== undefined ? !!draft.discussionEnabled : !!model.discussionEnabled,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt ?? null,
      publishedAt: model.publishedAt ?? null,
    };

    if (draft?.featuredImageUrl !== undefined) {
      (entity as any).featuredImageUrl = draft.featuredImageUrl;
    } else {
      (entity as any).featuredImageUrl = model.featuredImageUrl;
    }

    if (draft?.topics !== undefined) {
      (entity as any).topics = draft.topics;
    } else {
      (entity as any).topics = model.topics;
    }

    return new Publication(entity);
  }

  toPrimitives(): PublicationPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }
}
