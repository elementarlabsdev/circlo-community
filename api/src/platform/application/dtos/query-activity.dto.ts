import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer'; // For type conversion from query params
import { ApiPropertyOptional } from '@nestjs/swagger';

export enum ActivitySortBy {
  CREATED_AT = 'createdAt',
  ACTION = 'action',
  ACTOR_ID = 'actorId',
  TARGET_TYPE = 'targetType',
}

export enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class QueryActivityDto {
  @ApiPropertyOptional({
    description: 'Page number',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    default: 10,
    type: Number,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Limit the maximum number for performance
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'User ID (actor)' })
  @IsOptional()
  @IsString() // If you have UUID, you can use @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Action type (can be partial string for search)',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Target entity type' })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: 'Target entity ID' })
  @IsOptional()
  @IsString() // If you have UUID, you can use @IsUUID()
  targetId?: string;

  @ApiPropertyOptional({
    description: 'Start date for filtering (ISO 8601)',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'End date for filtering (ISO 8601)',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Sort field',
    enum: ActivitySortBy,
    default: ActivitySortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ActivitySortBy)
  sortBy?: ActivitySortBy = ActivitySortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
