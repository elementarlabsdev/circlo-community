import { IsBoolean, IsNotEmpty, IsNumber, Max, Min } from 'class-validator';

export class DiscussionSettingsDto {
  @IsBoolean()
  commentsEnabled: boolean;

  @IsBoolean()
  closeCommentsForOldPosts: boolean;

  @IsNumber()
  @Min(1)
  closeCommentsDaysOld: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(1)
  @Max(10)
  threadCommentsDepth: number;
}
