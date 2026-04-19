export interface PasswordResetCreateProps {
  id?: string;
  userId: string;
  code: number;
  hash: string;
  createdAt?: Date;
  verified?: boolean;
  sentAt?: Date;
  sentCount?: number;
}

interface PasswordResetProps {
  id: string;
  userId: string;
  code: number;
  hash: string;
  createdAt: Date;
  verified: boolean;
  sentAt: Date;
  sentCount: number;
}

export class PasswordReset {
  public readonly id: string;
  public readonly userId: string;
  public readonly code: number;
  public readonly hash: string;
  public readonly createdAt: Date;
  public readonly verified: boolean;
  public readonly sentAt: Date;
  public readonly sentCount: number;

  private constructor(props: PasswordResetProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.code = props.code;
    this.hash = props.hash;
    this.createdAt = props.createdAt;
    this.verified = props.verified;
    this.sentAt = props.sentAt;
    this.sentCount = props.sentCount;
  }

  public static create(props: PasswordResetCreateProps): PasswordReset {
    if (!props.userId || props.userId.trim() === '') {
      throw new Error('PasswordReset.userId is required');
    }
    if (!Number.isInteger(props.code)) {
      throw new Error('PasswordReset.code must be an integer');
    }
    if (props.code < 100000 || props.code > 999999) {
      throw new Error('PasswordReset.code must be a 6-digit number');
    }
    if (!props.hash || props.hash.trim() === '') {
      throw new Error('PasswordReset.hash is required');
    }

    return new PasswordReset({
      id: props.id!,
      userId: props.userId,
      code: props.code,
      hash: props.hash,
      createdAt: props.createdAt ?? new Date(),
      verified: props.verified ?? false,
      sentAt: props.sentAt ?? new Date(),
      sentCount: props.sentCount ?? 1,
    });
  }

  public static reconstitute(props: PasswordResetProps): PasswordReset {
    return new PasswordReset(props);
  }

  public toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      code: this.code,
      hash: this.hash,
      createdAt: this.createdAt,
      verified: this.verified,
      sentAt: this.sentAt,
      sentCount: this.sentCount,
    };
  }
}
