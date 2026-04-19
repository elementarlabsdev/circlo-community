export type ImageDesignPrimitives = {
  id: string;
  name: string;
  snapshot: any;
  userId: string;
  resultImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class ImageDesignEntity {
  private constructor(private props: ImageDesignPrimitives) {}

  static create(
    props: Omit<
      ImageDesignPrimitives,
      'id' | 'createdAt' | 'updatedAt' | 'snapshot'
    > & {
      id?: string;
      snapshot?: any;
      createdAt?: Date;
      updatedAt?: Date;
    },
  ): ImageDesignEntity {
    const now = new Date();
    return new ImageDesignEntity({
      ...props,
      id: props.id ?? crypto.randomUUID(),
      snapshot: props.snapshot ?? {},
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static reconstitute(props: ImageDesignPrimitives): ImageDesignEntity {
    return new ImageDesignEntity(props);
  }

  toPrimitives(): ImageDesignPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }

  get userId() {
    return this.props.userId;
  }

  update(
    props: Partial<
      Pick<ImageDesignPrimitives, 'name' | 'resultImageUrl' | 'snapshot'>
    >,
  ): void {
    if (props.name !== undefined) this.props.name = props.name;
    if (props.snapshot !== undefined)
      this.props.snapshot = props.snapshot;
    if (props.resultImageUrl !== undefined)
      this.props.resultImageUrl = props.resultImageUrl;
    this.props.updatedAt = new Date();
  }
}
