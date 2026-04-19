import { IsBoolean, IsOptional, IsNotEmpty } from 'class-validator';

export class CommentDto {
  @IsNotEmpty()
  content: string;

  @IsNotEmpty()
  @IsOptional()
  htmlContent?: string;

  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;
}
