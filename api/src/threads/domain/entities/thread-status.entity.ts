export type ThreadStatusPrimitives = {
  id: string;
  name: string;
  type: string; // machine-readable code, unique
};

export class ThreadStatus {
  private constructor(private readonly props: ThreadStatusPrimitives) {
    if (!props.id) throw new Error('ThreadStatus.id is required');
    if (!props.name || props.name.trim().length === 0)
      throw new Error('ThreadStatus.title is required');
    if (!props.type || props.type.trim().length === 0)
      throw new Error('ThreadStatus.type is required');
  }

  static create(attrs: ThreadStatusPrimitives): ThreadStatus {
    return new ThreadStatus({ ...attrs });
  }

  static fromPersistence(row: any): ThreadStatus {
    return new ThreadStatus({
      id: row.id,
      name: row.name,
      type: row.type,
    });
  }

  toPrimitives(): ThreadStatusPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get type() {
    return this.props.type;
  }
}
