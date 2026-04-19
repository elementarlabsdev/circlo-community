export class AnnouncementProps {
  id: string;
  name: string;
  content: string;
  typeId: string;
  type?: string;
  priority: number;
  dismissable: boolean;
  requireManualDismiss: boolean;
  targetUrl?: string;
  actionText?: string;
  startAt: Date;
  endAt?: Date;
  statusId: string;
  createdById: string;
  createdAt: Date;
  updatedAt?: Date;
}

export class Announcement {
  private constructor(private readonly props: AnnouncementProps) {}

  public static reconstitute(props: AnnouncementProps): Announcement {
    return new Announcement(props);
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get content(): string {
    return this.props.content;
  }

  get typeId(): string {
    return this.props.typeId;
  }

  get type(): string | undefined {
    return this.props.type;
  }

  get priority(): number {
    return this.props.priority;
  }

  get dismissable(): boolean {
    return this.props.dismissable;
  }

  get requireManualDismiss(): boolean {
    return this.props.requireManualDismiss;
  }

  get targetUrl(): string | undefined {
    return this.props.targetUrl;
  }

  get actionText(): string | undefined {
    return this.props.actionText;
  }

  get startAt(): Date {
    return this.props.startAt;
  }

  get endAt(): Date | undefined {
    return this.props.endAt;
  }

  get statusId(): string {
    return this.props.statusId;
  }

  get createdById(): string {
    return this.props.createdById;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date | undefined {
    return this.props.updatedAt;
  }

  public isActive(now: Date = new Date()): boolean {
    const isStarted = this.props.startAt <= now;
    const isNotExpired = !this.props.endAt || this.props.endAt > now;
    return isStarted && isNotExpired;
  }

  public toPrimitives() {
    return {
      ...this.props,
    };
  }
}
