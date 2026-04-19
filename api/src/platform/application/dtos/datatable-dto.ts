import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsArray,
} from 'class-validator';
import { Type } from 'class-transformer';

export type SortDirection = 'asc' | 'desc';

export class DataTableSortingItemDto {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsBoolean()
  desc?: boolean;
}

export class DataTableQueryDto {
  @IsInt()
  @Min(1)
  page: number = 1; // 1-based

  @IsOptional()
  @IsInt()
  @Min(1)
  pageSize?: number; // items per page

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortDir?: SortDirection;

  @IsOptional()
  @IsString()
  q?: string; // legacy global search term

  @IsOptional()
  @IsString()
  globalFilter?: string; // preferred global search term

  @IsOptional()
  @IsArray()
  globalSort?: Array<{ colId: string; sort: 'asc' | 'desc' }>; // ag-grid/emr-datatable sorting state

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DataTableSortingItemDto)
  sorting?: Array<DataTableSortingItemDto>; // TanStack sorting state (use first item)

  [key: string]: any;
}

export interface ColumnConfig {
  key: string; // Prisma field or relation title
  searchable?: boolean; // included in global search
  filterable?: boolean; // allows per-column filtering
  type?: 'string' | 'number' | 'boolean' | 'date' | 'datetime' | 'relation' | string; // 'relation' marks relation include by key
  width?: number; // optional column width in pixels
  pinned?: 'left' | 'right'; // optional pinning position
}

export interface DataTableConfig {
  entity: string; // prisma delegate key, e.g., 'user'
  columns: ColumnConfig[];
  defaultSortBy?: string;
  defaultSortDir?: SortDirection;
}

export class DataTableResponseDto<T = any> {
  data!: T[];
  total!: number;
  page!: number;
  pageSize!: number;
}
