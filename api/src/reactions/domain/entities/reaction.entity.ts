export type ReactionPrimitives = {
  id: string;
  name: string;
  type: string;
  position: number;
  iconUrl: string;
  iconId?: string | null;
  // Optional projection of related icon media if needed by presenters
  icon?: any;
};

export class Reaction {
  private constructor(private readonly props: ReactionPrimitives) {
    if (!props.id) throw new Error('Reaction.id is required');
    if (!props.name) throw new Error('Reaction.title is required');
    if (!props.type) throw new Error('Reaction.type is required');
    if (props.position == null) this.props.position = 0;
    if (!props.iconUrl) throw new Error('Reaction.iconUrl is required');
    if (this.props.iconId === undefined) this.props.iconId = null;
  }

  static create(attrs: ReactionPrimitives): Reaction {
    return new Reaction({ ...attrs });
  }

  static fromPersistence(row: any): Reaction {
    return new Reaction({
      id: row.id,
      name: row.name,
      type: row.type,
      position: row.position ?? 0,
      iconUrl: row.iconUrl,
      iconId: row.iconId ?? row.icon?.id ?? null,
      icon: row.icon,
    });
  }

  toPrimitives(): ReactionPrimitives {
    return { ...this.props };
  }

  // Getters
  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get type() {
    return this.props.type;
  }
  get position() {
    return this.props.position;
  }
  get iconUrl() {
    return this.props.iconUrl;
  }
  get iconId() {
    return this.props.iconId ?? null;
  }
  get icon() {
    return this.props.icon;
  }
}
