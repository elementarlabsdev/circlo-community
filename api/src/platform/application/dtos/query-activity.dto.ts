import {
  IsOptional,
  IsString,
  IsInt,
  Min,
  Max,
  IsDate,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer'; // Для преобразования типов из query params
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
    description: 'Номер страницы',
    default: 1,
    type: Number,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Количество элементов на странице',
    default: 10,
    type: Number,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100) // Ограничиваем максимальное количество для производительности
  limit?: number = 10;

  @ApiPropertyOptional({ description: 'ID пользователя (актора)' })
  @IsOptional()
  @IsString() // Если у вас UUID, можно использовать @IsUUID()
  actorId?: string;

  @ApiPropertyOptional({
    description: 'Тип действия (можно часть строки для поиска)',
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ description: 'Тип целевой сущности' })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: 'ID целевой сущности' })
  @IsOptional()
  @IsString() // Если у вас UUID, можно использовать @IsUUID()
  targetId?: string;

  @ApiPropertyOptional({
    description: 'Начальная дата для фильтрации (ISO 8601)',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startDate?: Date;

  @ApiPropertyOptional({
    description: 'Конечная дата для фильтрации (ISO 8601)',
    type: Date,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  endDate?: Date;

  @ApiPropertyOptional({
    description: 'Поле для сортировки',
    enum: ActivitySortBy,
    default: ActivitySortBy.CREATED_AT,
  })
  @IsOptional()
  @IsEnum(ActivitySortBy)
  sortBy?: ActivitySortBy = ActivitySortBy.CREATED_AT;

  @ApiPropertyOptional({
    description: 'Порядок сортировки',
    enum: SortOrder,
    default: SortOrder.DESC,
  })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
