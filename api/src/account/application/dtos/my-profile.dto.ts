import { IsNotEmpty } from 'class-validator';

export class MyProfileDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  username: string;

  avatarUrl: string;

  jobTitle: string;

  bio: string;
}
