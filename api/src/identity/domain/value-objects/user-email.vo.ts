import { BadRequestException } from '@nestjs/common';

export class UserEmail {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
    Object.freeze(this);
  }


  public static create(value: string): UserEmail {
    if (!this.isValid(value)) {
      throw new BadRequestException('Invalid email address format.');
    }
    return new UserEmail(value.toLowerCase());
  }

  get value(): string {
    return this._value;
  }

  /**
   * @param email
   * @private
   */
  private static isValid(email: string): boolean {
    if (!email) {
      return false;
    }

    const emailRegex = new RegExp(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );
    return emailRegex.test(email);
  }

  public equals(otherEmail: UserEmail): boolean {
    return this._value === otherEmail.value;
  }
}
