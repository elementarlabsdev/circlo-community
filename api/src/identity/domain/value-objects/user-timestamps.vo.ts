import { BadRequestException } from '@nestjs/common';

/**
 * Interface for properties describing timestamps.
 * Used when reconstituting the object from the database.
 */
export interface UserTimestampsProps {
  createdAt: Date;
  updatedAt: Date | null;
  lastActivityAt: Date | null;
  notificationsViewedAt: Date | null;
}

/**
 * Value Object for managing user timestamps.
 * Ensures immutability and encapsulates date update logic.
 */
export class UserTimestamps {
  public readonly createdAt: Date;
  public readonly updatedAt: Date | null;
  public readonly lastActivityAt: Date | null;
  public readonly notificationsViewedAt: Date | null;

  /**
   * The constructor is private to ensure that instances
   * are created only through static factory methods.
   */
  private constructor(props: UserTimestampsProps) {
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
    this.lastActivityAt = props.lastActivityAt;
    this.notificationsViewedAt = props.notificationsViewedAt;
    Object.freeze(this);
  }

  /**
   * Static factory method to create a VO for a new user.
   * Sets `createdAt` and initial null values for other fields.
   */
  public static create(): UserTimestamps {
    return new UserTimestamps({
      createdAt: new Date(),
      updatedAt: null,
      lastActivityAt: null,
      notificationsViewedAt: null,
    });
  }

  /**
   * Static factory method to reconstitute the VO from the database.
   * Accepts existing data and creates an object from it.
   * @param props - Timestamp data from storage.
   */
  public static reconstitute(props: UserTimestampsProps): UserTimestamps {
    // Example business rule: the update date cannot be earlier than the creation date.
    if (props.updatedAt && props.updatedAt < props.createdAt) {
      throw new BadRequestException(
        'Updated date cannot be earlier than the created date.',
      );
    }
    return new UserTimestamps(props);
  }

  /**
   * Returns a new instance with the `updatedAt` date updated to the current time.
   * Used for tracking changes in the aggregate.
   */
  public touch(): UserTimestamps {
    // Return a new instance, preserving other values
    return new UserTimestamps({ ...this, updatedAt: new Date() });
  }

  /**
   * Returns a new instance with the last activity date updated.
   */
  public recordActivity(): UserTimestamps {
    return new UserTimestamps({ ...this, lastActivityAt: new Date() });
  }

  /**
   * Returns a new instance with the notifications viewed date updated.
   */
  public recordNotificationsViewed(): UserTimestamps {
    return new UserTimestamps({ ...this, notificationsViewedAt: new Date() });
  }

  /**
   * Compares the current object with another by value.
   */
  public equals(other: UserTimestamps): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    // Compare time in milliseconds for correct date comparison
    return (
      this.createdAt.getTime() === other.createdAt.getTime() &&
      this.updatedAt?.getTime() === other.updatedAt?.getTime() &&
      this.lastActivityAt?.getTime() === other.lastActivityAt?.getTime() &&
      this.notificationsViewedAt?.getTime() ===
        other.notificationsViewedAt?.getTime()
    );
  }
}
