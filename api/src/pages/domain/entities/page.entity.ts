export type PagePrimitives = {
  id: string;
  title: string;
  slug: string | null;
  hash: string;
  textContent: string;
  blocksContent: unknown[];
  authorId: string | null;
  statusId: string;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImageId: string | null;
  featuredImageUrl: string | null;
  readingTime: number;
  version: number;
  hasChanges: boolean;
  lastPublishedDraftVersion: number;
  createdAt: Date;
  updatedAt: Date | null;
  publishedAt: Date | null;
};

export class PageEntity {
  private constructor(private props: PagePrimitives) {}

  static create(
    props: Omit<
      PagePrimitives,
      'id' | 'createdAt' | 'updatedAt' | 'version' | 'hasChanges' | 'slug' | 'lastPublishedDraftVersion'
    > & {
      id?: string;
      createdAt?: Date;
      updatedAt?: Date | null;
      version?: number;
      hasChanges?: boolean;
      slug?: string | null;
      lastPublishedDraftVersion?: number;
    },
  ): PageEntity {
    const now = props.createdAt ?? new Date();
    const entity: PagePrimitives = {
      id: props.id ?? crypto.randomUUID(),
      title: props.title,
      slug: props.slug ?? null,
      hash: props.hash,
      textContent: props.textContent ?? '',
      blocksContent: props.blocksContent ?? [],
      authorId: props.authorId ?? null,
      statusId: props.statusId,
      metaTitle: props.metaTitle ?? null,
      metaDescription: props.metaDescription ?? null,
      featuredImageId: props.featuredImageId ?? null,
      featuredImageUrl: props.featuredImageUrl ?? null,
      readingTime: props.readingTime ?? 0,
      version: props.version ?? 1,
      hasChanges: props.hasChanges ?? false,
      lastPublishedDraftVersion: props.lastPublishedDraftVersion ?? 0,
      createdAt: now,
      updatedAt: props.updatedAt ?? null,
      publishedAt: props.publishedAt ?? null,
    };
    return new PageEntity(entity);
  }

  static reconstitute(model: any): PageEntity {
    const draft = model.drafts?.[0]?.draft as any;
    const entity: PagePrimitives = {
      id: model.id,
      title: draft?.title ?? model.title,
      slug: draft?.slug ?? model.slug ?? null,
      hash: model.hash,
      textContent: draft?.textContent ?? model.textContent ?? '',
      blocksContent: draft?.blocksContent ?? model.blocksContent ?? [],
      authorId: model.authorId ?? null,
      statusId: model.statusId,
      metaTitle: draft?.metaTitle ?? model.metaTitle ?? null,
      metaDescription: draft?.metaDescription ?? model.metaDescription ?? null,
      featuredImageId: draft?.featuredImageId ?? model.featuredImageId ?? null,
      featuredImageUrl: draft?.featuredImageUrl ?? model.featuredImageUrl ?? null,
      readingTime: model.readingTime ?? 0,
      version: model.version ?? 1,
      hasChanges: !!model.hasChanges,
      lastPublishedDraftVersion: model.lastPublishedDraftVersion ?? 0,
      createdAt: model.createdAt,
      updatedAt: model.updatedAt ?? null,
      publishedAt: model.publishedAt ?? null,
    };
    return new PageEntity(entity);
  }

  toPrimitives(): PagePrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }
}
