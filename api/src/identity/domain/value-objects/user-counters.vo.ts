import { BadRequestException } from '@nestjs/common';

export interface UserCountersProps {
  publications: number;
  comments: number;
  followers: number;
  credits: number;
  tutorials: number;
}

export class UserCounters {
  public readonly publications: number;
  public readonly comments: number;
  public readonly followers: number;
  public readonly credits: number;
  public readonly tutorials: number;

  private constructor(props: UserCountersProps) {
    this.publications = props.publications;
    this.comments = props.comments;
    this.followers = props.followers;
    this.credits = props.credits;
    this.tutorials = props.tutorials;
    Object.freeze(this);
  }

  public static create(
    initialProps?: Partial<UserCountersProps>,
  ): UserCounters {
    const defaults: UserCountersProps = {
      publications: 0,
      comments: 0,
      followers: 0,
      credits: 0,
      tutorials: 0,
    };

    const props = { ...defaults, ...initialProps };

    for (const key in props) {
      const value = props[key as keyof UserCountersProps];
      if (!Number.isInteger(value) || value < 0) {
        throw new BadRequestException(
          `Counter '${key}' must be a non-negative integer.`,
        );
      }
    }

    return new UserCounters(props);
  }

  public incrementPublications(): UserCounters {
    return new UserCounters({ ...this, publications: this.publications + 1 });
  }

  public decrementPublications(): UserCounters {
    if (this.publications <= 0) {
      throw new Error('Publications counter cannot be less than zero.');
    }
    return new UserCounters({ ...this, publications: this.publications - 1 });
  }

  public incrementFollowers(): UserCounters {
    return new UserCounters({ ...this, followers: this.followers + 1 });
  }

  public decrementFollowers(): UserCounters {
    if (this.followers <= 0) {
      throw new Error('Followers counter cannot be less than zero.');
    }
    return new UserCounters({ ...this, followers: this.followers - 1 });
  }

  public incrementTutorials(): UserCounters {
    return new UserCounters({ ...this, tutorials: this.tutorials + 1 });
  }

  public decrementTutorials(): UserCounters {
    if (this.tutorials <= 0) {
      throw new Error('Tutorials counter cannot be less than zero.');
    }
    return new UserCounters({ ...this, tutorials: this.tutorials - 1 });
  }

  public addCredits(amount: number): UserCounters {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        'The number of credits to add must be a positive integer.',
      );
    }
    return new UserCounters({ ...this, credits: this.credits + amount });
  }

  public spendCredits(amount: number): UserCounters {
    if (!Number.isInteger(amount) || amount <= 0) {
      throw new BadRequestException(
        'The number of credits to spend must be a positive integer.',
      );
    }
    if (this.credits < amount) {
      throw new BadRequestException('Not enough credits to spend.');
    }
    return new UserCounters({ ...this, credits: this.credits - amount });
  }

  public equals(other: UserCounters): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.publications === other.publications &&
      this.comments === other.comments &&
      this.followers === other.followers &&
      this.credits === other.credits &&
      this.tutorials === other.tutorials
    );
  }
}
