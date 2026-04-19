import { IsNotEmpty } from 'class-validator';

export class TopicDto {
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  slug: string;

  description: string;

  logoUrl: string;

  logoId: string | null;

  metaTitle: string;
  metaDescription: string;
}
