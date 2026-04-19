import { IsInt, IsOptional, IsPositive, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class FeedListQueryDto {
  @IsString()
  @IsOptional()
  type?: string = 'default';

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @IsOptional()
  pageSize?: number = 20;
}
