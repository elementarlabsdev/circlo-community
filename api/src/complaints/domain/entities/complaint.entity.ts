export type ComplaintPrimitives = {
  id: string;
  name?: string | null;
  targetType: string;
  targetId: string;
  reporterId?: string | null;
  reporterIp?: string | null;
  reportedUrl?: string | null;
  reason: string;
  status: string;
  details?: string | null;
  attachmentIds: string[];
  internalNotes?: ComplaintInternalNotePrimitives[] | null;
  createdAt: Date;
  updatedAt: Date;
};

export type ComplaintInternalNotePrimitives = {
  id: string;
  complaintId: string;
  type: string;
  content?: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export class Complaint {
  private constructor(private readonly props: ComplaintPrimitives) {}

  static create(params: Omit<ComplaintPrimitives, 'id' | 'createdAt' | 'updatedAt' | 'status'> & {
    id?: string;
    name?: string;
    status?: string;
    createdAt?: Date;
    updatedAt?: Date;
  }) {
    const {
      id = '',
      name,
      targetType,
      targetId,
      reporterId,
      reporterIp,
      reportedUrl,
      reason,
      status = 'pending',
      details,
      attachmentIds,
      internalNotes = [],
      createdAt = new Date(),
      updatedAt = new Date(),
    } = params;

    if (!targetType || !targetId || !reason) {
      throw new Error('Invalid Complaint: required fields are missing');
    }
    if (reason.length < 2 || reason.length > 64) {
      throw new Error('Invalid Complaint: reason length is out of bounds');
    }

    return new Complaint({
      id,
      name: name ?? null,
      targetType: targetType.toLowerCase(),
      targetId,
      reporterId: reporterId ?? null,
      reporterIp: reporterIp ?? null,
      reportedUrl: reportedUrl ?? null,
      reason,
      status,
      details: details ?? null,
      attachmentIds: attachmentIds ?? [],
      internalNotes: internalNotes ?? [],
      createdAt,
      updatedAt,
    });
  }

  static fromPrimitives(p: ComplaintPrimitives) {
    return new Complaint(p);
  }

  toPrimitives(): ComplaintPrimitives {
    return { ...this.props };
  }

  get id() {
    return this.props.id;
  }
  get name() {
    return this.props.name;
  }
  get targetType() {
    return this.props.targetType;
  }
  get targetId() {
    return this.props.targetId;
  }
  get reporterId() {
    return this.props.reporterId;
  }
  get reporterIp() {
    return this.props.reporterIp ?? null;
  }
  get reportedUrl() {
    return this.props.reportedUrl ?? null;
  }
  get reason() {
    return this.props.reason;
  }
  get status() {
    return this.props.status;
  }
  get details() {
    return this.props.details;
  }
  get attachmentIds() {
    return this.props.attachmentIds;
  }
  get internalNotes() {
    return this.props.internalNotes ?? [];
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
}
