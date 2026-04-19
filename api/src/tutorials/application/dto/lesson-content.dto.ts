import { IsArray } from 'class-validator';

export class LessonContentDto {
  @IsArray()
  blocksContent: any[];
}
