export interface LoginSessionCreateProps {
  id?: string;
  userId: string;
  device: string;
  ipAddress: string;
  location?: string | null;
  userAgent?: string | null;
  createdAt?: Date;
  lastActivityAt?: Date | null;
  isCurrent?: boolean;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

interface LoginSessionProps {
  id: string;
  userId: string;
  device: string;
  ipAddress: string;
  location?: string | null;
  userAgent?: string | null;
  createdAt: Date;
  lastActivityAt?: Date | null;
  isCurrent: boolean;
  expiresAt?: Date | null;
  revokedAt?: Date | null;
  metadata?: Record<string, unknown> | null;
}

export class LoginSession {
  public readonly id: string;
  public readonly userId: string;
  public readonly device: string;
  public readonly ipAddress: string;
  public readonly createdAt: Date;

  private _location?: string | null;
  private _userAgent?: string | null;
  private _lastActivityAt?: Date | null;
  private _isCurrent: boolean;
  private _expiresAt?: Date | null;
  private _revokedAt?: Date | null;
  private _metadata?: Record<string, unknown> | null;

  private constructor(props: LoginSessionProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.device = props.device;
    this.ipAddress = props.ipAddress;
    this.createdAt = props.createdAt;
    this._location = props.location ?? null;
    this._userAgent = props.userAgent ?? null;
    this._lastActivityAt = props.lastActivityAt ?? null;
    this._isCurrent = props.isCurrent;
    this._expiresAt = props.expiresAt ?? null;
    this._revokedAt = props.revokedAt ?? null;
    this._metadata = props.metadata ?? null;
  }

  public static create(props: LoginSessionCreateProps): LoginSession {
    if (!props.userId) throw new Error('LoginSession.userId is required');
    if (!props.device) throw new Error('LoginSession.device is required');
    if (!props.ipAddress) throw new Error('LoginSession.ipAddress is required');

    return new LoginSession({
      id: props.id ?? crypto.randomUUID?.() ?? Math.random().toString(36).slice(2),
      userId: props.userId,
      device: props.device,
      ipAddress: props.ipAddress,
      location: props.location ?? null,
      userAgent: props.userAgent ?? null,
      createdAt: props.createdAt ?? new Date(),
      lastActivityAt: props.lastActivityAt ?? null,
      isCurrent: props.isCurrent ?? true,
      expiresAt: props.expiresAt ?? null,
      revokedAt: props.revokedAt ?? null,
      metadata: props.metadata ?? null,
    });
  }

  public static reconstitute(props: LoginSessionProps): LoginSession {
    return new LoginSession(props);
  }

  public revoke(date: Date = new Date()): void {
    this._revokedAt = date;
    this._isCurrent = false;
  }

  public touchActivity(date: Date = new Date()): void {
    this._lastActivityAt = date;
  }

  public markCurrent(): void {
    this._isCurrent = true;
  }

  public markExpired(): void {
    this._isCurrent = false;
  }

  public toPrimitives() {
    return {
      id: this.id,
      userId: this.userId,
      device: this.device,
      ipAddress: this.ipAddress,
      location: this._location ?? null,
      userAgent: this._userAgent ?? null,
      createdAt: this.createdAt,
      lastActivityAt: this._lastActivityAt ?? null,
      isCurrent: this._isCurrent,
      expiresAt: this._expiresAt ?? null,
      revokedAt: this._revokedAt ?? null,
      metadata: this._metadata ?? null,
    };
  }
}
