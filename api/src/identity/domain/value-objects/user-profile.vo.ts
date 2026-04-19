import { BadRequestException } from '@nestjs/common';

export interface UserProfileProps {
  name: string;
  username: string;
  preferredColorScheme: string;
  jobTitle?: string | null;
  bio?: string | null;
  location?: string | null;
  avatarUrl?: string | null;
  birthDate?: Date | null;
  gender?: string | null;
}

export class UserProfile {
  public readonly name: string;
  public readonly username: string;
  public readonly jobTitle: string | null;
  public readonly bio: string | null;
  public readonly location: string | null;
  public readonly avatarUrl: string | null;
  public readonly birthDate: Date | null;
  public readonly gender: string | null;
  public readonly preferredColorScheme: string;

  private constructor(props: UserProfileProps) {
    this.name = props.name;
    this.username = props.username;
    this.preferredColorScheme = props.preferredColorScheme;
    this.jobTitle = props.jobTitle ?? null;
    this.bio = props.bio ?? null;
    this.location = props.location ?? null;
    this.avatarUrl = props.avatarUrl ?? null;
    this.birthDate = props.birthDate ?? null;
    this.gender = props.gender ?? null;

    Object.freeze(this);
  }

  public static create(props: UserProfileProps): UserProfile {
    if (!props.name || props.name.trim().length < 2) {
      throw new BadRequestException('Name must be at least 2 characters long.');
    }

    if (!props.username) {
      throw new BadRequestException('Username is required.');
    }

    const usernameRegex = /^[a-zA-Z0-9_\-]{3,20}$/;
    if (!usernameRegex.test(props.username)) {
      throw new BadRequestException(
        'Username must be 3 to 20 characters and contain only letters, digits, underscores, and hyphens.',
      );
    }

    if (props.bio && props.bio.length > 500) {
      throw new BadRequestException('Bio must not exceed 500 characters.');
    }

    return new UserProfile(props);
  }

  public update(updatedProps: Partial<UserProfileProps>): UserProfile {
    return UserProfile.create({
      name: updatedProps.name ?? this.name,
      username: updatedProps.username ?? this.username,
      jobTitle: updatedProps.jobTitle ?? this.jobTitle,
      bio: updatedProps.bio ?? this.bio,
      location: updatedProps.location ?? this.location,
      avatarUrl: updatedProps.avatarUrl ?? this.avatarUrl,
      birthDate: updatedProps.birthDate ?? this.birthDate,
      gender: updatedProps.gender ?? this.gender,
      preferredColorScheme: updatedProps.preferredColorScheme,
    });
  }

  public equals(other: UserProfile): boolean {
    if (other === null || other === undefined) {
      return false;
    }
    return (
      this.name === other.name &&
      this.username === other.username &&
      this.jobTitle === other.jobTitle &&
      this.bio === other.bio &&
      this.location === other.location &&
      this.avatarUrl === other.avatarUrl &&
      this.birthDate?.getTime() === other.birthDate?.getTime() &&
      this.gender === other.gender
    );
  }
}
