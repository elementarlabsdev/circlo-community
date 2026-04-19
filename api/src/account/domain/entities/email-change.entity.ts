export class EmailChange {
  private constructor(
    public readonly userId: string,
    public readonly newEmail: string,
    public readonly codeHash: string,
    public readonly expiresAt: Date,
    public readonly createdAt: Date = new Date(),
  ) {}

  static create(props: {
    userId: string;
    newEmail: string;
    codeHash: string;
    expiresAt: Date;
    createdAt?: Date;
  }): EmailChange {
    return new EmailChange(
      props.userId,
      props.newEmail,
      props.codeHash,
      props.expiresAt,
      props.createdAt ?? new Date(),
    );
  }

  isExpired(now: Date = new Date()): boolean {
    return this.expiresAt.getTime() < now.getTime();
  }
}
