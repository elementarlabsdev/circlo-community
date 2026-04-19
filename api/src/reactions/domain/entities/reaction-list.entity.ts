export type ReactionListPrimitives = {
  id: string;
  targetType: string;
  targetId: string;
  actorId?: string | null;
  reactionId?: string | null;
  // Optional projections for presentation layer
  actor?: any;
  reaction?: any;
};

export class ReactionList {
  private constructor(private readonly props: ReactionListPrimitives) {
    if (!props.id) throw new Error('ReactionList.id is required');
    if (!props.targetType) throw new Error('ReactionList.targetType is required');
    if (!props.targetId) throw new Error('ReactionList.targetId is required');
    if (this.props.actorId === undefined) this.props.actorId = null;
    if (this.props.reactionId === undefined) this.props.reactionId = null;
  }

  static create(attrs: ReactionListPrimitives): ReactionList {
    return new ReactionList({ ...attrs });
  }

  static fromPersistence(row: any): ReactionList {
    return new ReactionList({
      id: row.id,
      targetType: row.targetType,
      targetId: row.targetId,
      actorId: row.actorId ?? row.actor?.id ?? null,
      reactionId: row.reactionId ?? row.reaction?.id ?? null,
      actor: row.actor,
      reaction: row.reaction,
    });
  }

  toPrimitives(): ReactionListPrimitives {
    return { ...this.props };
  }

  // Getters
  get id() {
    return this.props.id;
  }
  get targetType() {
    return this.props.targetType;
  }
  get targetId() {
    return this.props.targetId;
  }
  get actorId() {
    return this.props.actorId ?? null;
  }
  get reactionId() {
    return this.props.reactionId ?? null;
  }
  get actor() {
    return this.props.actor;
  }
  get reaction() {
    return this.props.reaction;
  }
}
