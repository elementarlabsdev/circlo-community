export interface EmailVerificationCreateProps {
  id?: string;
  userId: string;
  code: number;
  hash: string;
  createdAt?: Date;
  sentAt?: Date;
  sentCount?: number;
  blockedUntil?: Date | null;
  expireAt?: Date;
}

interface EmailVerificationProps {
  id: string;
  userId: string;
  code: number;
  hash: string;
  createdAt: Date;
  sentAt: Date;
  sentCount: number;
  blockedUntil: Date | null;
  expireAt: Date;
}

export class EmailVerification {
  public readonly id: string;
  public readonly userId: string;
  public readonly code: number;
  public readonly hash: string;
  public readonly createdAt: Date;
  public readonly sentAt: Date;
  public readonly sentCount: number;
  public readonly blockedUntil: Date | null;
  public readonly expireAt: Date;

  private constructor(props: EmailVerificationProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.code = props.code;
    this.hash = props.hash;
    this.createdAt = props.createdAt;
    this.sentAt = props.sentAt;
    this.sentCount = props.sentCount;
    this.blockedUntil = props.blockedUntil;
    this.expireAt = props.expireAt;
  }

  public static create(props: EmailVerificationCreateProps): EmailVerification {
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('EmailVerification.userId is required');
    }
    if (!Number.isInteger(props.code)) {
      throw new Error('EmailVerification.code must be an integer');
    }
    // Optional: enforce 6-digit code as currently generated in the system
    if (props.code < 100000 || props.code > 999999) {
      throw new Error('EmailVerification.code must be a 6-digit number');
    }
    if (!props.hash || props.hash.trim() === '') {
      throw new Error('EmailVerification.hash is required');
    }

    const createdAt = props.createdAt ?? new Date();
    const expireAt =
      props.expireAt ?? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000);

    return new EmailVerification({
      id: props.id,
      userId: props.userId,
      code: props.code,
      hash: props.hash,
      createdAt,
      sentAt: props.sentAt ?? new Date(),
      sentCount: props.sentCount ?? 1,
      blockedUntil: props.blockedUntil ?? null,
      expireAt,
    });
  }

  public static reconstitute(props: EmailVerificationProps): EmailVerification {
    return new EmailVerification(props);
  }

  public toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      code: this.code,
      hash: this.hash,
      createdAt: this.createdAt,
      sentAt: this.sentAt,
      sentCount: this.sentCount,
      blockedUntil: this.blockedUntil,
      expireAt: this.expireAt,
    };
  }
}
