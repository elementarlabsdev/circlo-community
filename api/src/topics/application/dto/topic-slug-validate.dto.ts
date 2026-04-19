import { IsNotEmpty } from 'class-validator';

export class TopicSlugValidateDto {
  topicId: string | null;

  @IsNotEmpty()
  slug: string;
}
