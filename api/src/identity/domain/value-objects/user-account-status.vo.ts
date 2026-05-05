import { BadRequestException } from '@nestjs/common';

/**
 * Interface for properties describing the account status.
 * Using `Partial` in `create` makes it more flexible.
 */
export interface UserAccountStatusProps {
  isBlocked: boolean;
  verified: boolean;
  isSuperAdmin: boolean;
  isDeactivated: boolean;
  hasPaidAccount: boolean;
}

export class UserAccountStatus {
  public readonly isBlocked: boolean;
  public readonly verified: boolean;
  public readonly isSuperAdmin: boolean;
  public readonly isDeactivated: boolean;
  public readonly hasPaidAccount: boolean;

  /**
   * Private constructor for instance creation control.
   */
  private constructor(props: UserAccountStatusProps) {
    this.isBlocked = props.isBlocked;
    this.verified = props.verified;
    this.isSuperAdmin = props.isSuperAdmin;
    this.isDeactivated = props.isDeactivated;
    this.hasPaidAccount = props.hasPaidAccount;
    Object.freeze(this);
  }

  /**
   * Static factory method for creating the status.
   * Sets safe default values for a new account.
   */
  public static create(
    initialProps?: Partial<UserAccountStatusProps>,
  ): UserAccountStatus {
    const defaults: UserAccountStatusProps = {
      isBlocked: false,
      verified: false, // Verification often happens later
      isSuperAdmin: false,
      isDeactivated: false,
      hasPaidAccount: false,
    };

    const props = { ...defaults, ...initialProps };

    // Business rule: A super admin cannot be created in a blocked state.
    if (props.isSuperAdmin && props.isBlocked) {
      throw new BadRequestException(
        'A super admin cannot be blocked at creation.',
      );
    }

    return new UserAccountStatus(props);
  }

  /**
   * Returns a new status instance with the blocked flag.
   * Encapsulates the business rule about blocking a super admin.
   * @returns {UserAccountStatus} New status object.
   * @throws {Error} If there is an attempt to block a super admin.
   */
  public block(): UserAccountStatus {
    if (this.isSuperAdmin) {
      throw new Error('You cannot block a super admin.');
    }
    // Return a new instance instead of mutating the current one
    return new UserAccountStatus({ ...this, isBlocked: true });
  }

  public unblock(): UserAccountStatus {
    return new UserAccountStatus({ ...this, isBlocked: false });
  }

  public verify(): UserAccountStatus {
    return new UserAccountStatus({ ...this, verified: true });
  }

  /**
   * Compares the current status object with another.
   */
  public equals(other: UserAccountStatus): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.isBlocked === other.isBlocked &&
      this.verified === other.verified &&
      this.isSuperAdmin === other.isSuperAdmin &&
      this.isDeactivated === other.isDeactivated &&
      this.hasPaidAccount === other.hasPaidAccount
    );
  }
}
