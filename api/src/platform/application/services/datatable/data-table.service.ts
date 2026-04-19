import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

// Keep type imports used in parseValue
import {
  ColumnConfig,
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

@Injectable()
export class DataTableService<T = any> {
  constructor(
    protected readonly prisma: PrismaService,
    protected readonly config: DataTableConfig,
  ) {}

  async query(dto: DataTableQueryDto, context?: any): Promise<DataTableResponseDto<T>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortDir,
      q,
    } = this.normalizeQuery(dto);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = this.buildWhere(dto as any, q);
    const orderBy = this.buildOrderBy(sortBy, sortDir);
    const include = this.buildIncludeFromForeignKeys();

    const delegate = (this.prisma as any)[this.config.entity];
    if (!delegate) {
      throw new Error(
        `Prisma delegate not found for entity: ${this.config.entity}`,
      );
    }

    const [total, data] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({ where, orderBy, skip, take, include }),
    ]);

    return { data, total, page, pageSize };
  }

  protected normalizeQuery(
    dto: DataTableQueryDto,
  ): Required<Pick<DataTableQueryDto, 'page' | 'pageSize'>> &
    Pick<DataTableQueryDto, 'sortBy' | 'sortDir' | 'q'> {
    const page = dto.page || 1;
    const pageSize = dto.pageSize || 50;

    // Accept both legacy sortBy/sortDir and emr-datatable's "sorting" array
    let sortBy = dto.sortBy || this.config.defaultSortBy;
    let sortDir = (dto.sortDir || this.config.defaultSortDir || 'asc') as
      | 'asc'
      | 'desc';

    const sorting = dto.sorting;
    if (Array.isArray(sorting) && sorting.length > 0) {
      const s0 = sorting[0];
      if (s0 && s0.id) sortBy = s0.id;
      if (s0 && typeof s0.desc === 'boolean') sortDir = s0.desc ? 'desc' : 'asc';
    }

    const globalSort = dto.globalSort;
    if (Array.isArray(globalSort) && globalSort.length > 0) {
      const s0 = globalSort[0];
      if (s0 && s0.colId) sortBy = s0.colId;
      if (s0 && s0.sort) sortDir = s0.sort;
    }

    // Accept both legacy q and emr-datatable's globalFilter
    const q = dto.q || dto.globalFilter || undefined;
    return { page, pageSize, sortBy, sortDir, q };
  }

  protected buildOrderBy(sortBy?: string, sortDir?: 'asc' | 'desc') {
    const by = sortBy || this.config.defaultSortBy;
    if (!by) return undefined;

    const dir = sortDir || 'asc';
    const parts = by.split('.');

    if (parts.length === 1) {
      return { [by]: dir } as any;
    }

    // Construct nested object for Prisma (e.g., publication.title -> { publication: { title: 'asc' } })
    const result: any = {};
    let current = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        current[part] = dir;
      } else {
        current[part] = {};
        current = current[part];
      }
    }
    return result;
  }

  protected buildWhere(rawQuery: Record<string, any>, q?: string) {
    const searchable = new Set(
      this.config.columns
        .filter((c) => c.searchable && c.type !== 'relation')
        .map((c) => c.key),
    );
    const filterable = new Map(
      this.config.columns
        .filter((c) => c.filterable && c.type !== 'relation')
        .map((c) => [c.key, c.type || 'string'] as const),
    );

    const andClauses: any[] = [];

    // Column filters: filter_<column>=value, and range: filter_<column>_from/to
    for (const [key, value] of Object.entries(rawQuery)) {
      if (!key.startsWith('filter_')) continue;
      const rest = key.slice('filter_'.length);

      if (rest.endsWith('_from') || rest.endsWith('_to')) {
        const base = rest.replace(/_(from|to)$/i, '');
        if (!filterable.has(base)) continue;
        const type = filterable.get(base)!;
        const op = rest.endsWith('_from') ? 'gte' : 'lte';
        const parsed = this.parseValue(String(value), type);
        if (!parsed && parsed !== false && parsed !== 0) continue;
        let clause = andClauses.find((c) => c[base]);
        if (!clause) {
          clause = { [base]: {} };
          andClauses.push(clause);
        }
        clause[base][op] = parsed;
      } else {
        const col = rest;
        if (!filterable.has(col)) continue;
        const type = filterable.get(col)!;
        const parsed = this.parseValue(String(value), type);
        if (parsed === undefined) continue;
        if (type === 'string') {
          andClauses.push({
            [col]: { contains: String(parsed), mode: 'insensitive' },
          });
        } else {
          andClauses.push({ [col]: parsed });
        }
      }
    }

    // Global search
    if (q && searchable.size > 0) {
      const or: any[] = [];
      for (const col of searchable) {
        or.push({ [col]: { contains: q, mode: 'insensitive' } });
      }
      if (or.length) andClauses.push({ OR: or });
    }

    if (andClauses.length === 0) return undefined;
    return { AND: andClauses };
  }

  protected parseValue(value: string, type: ColumnConfig['type']) {
    switch (type) {
      case 'boolean':
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
      case 'number':
        if (value === '' || value === null) return undefined;
        return Number(value);
      case 'date':
      case 'datetime':
        if (!value) return undefined;
        const d = new Date(value);
        if (Number.isNaN(d.getTime())) return undefined;
        return d;
      default:
        return value;
    }
  }

  protected buildIncludeFromForeignKeys(): Record<string, any> | undefined {
    if (!this.config?.columns) return undefined;
    const include: any = {};
    const columnKeys = new Set(
      this.config.columns.map((c) => (typeof c.key === 'string' ? c.key : '')),
    );
    for (const col of this.config.columns) {
      const key = col.key;
      if (typeof key !== 'string') continue;

      if (col.type === 'relation') {
        const parts = key.split('.');
        if (parts.length > 0) {
          include[parts[0]] = true;
        }
        continue;
      }

      if (key.endsWith('Id') && key.length > 2) {
        const relation = key.substring(0, key.length - 2); // strip trailing 'Id'
        // Skip polymorphic pairs like targetType + targetId where no actual relation exists
        // Heuristic: if a sibling "<name>Type" column exists, do not auto-include "<name>"
        if (columnKeys.has(`${relation}Type`)) {
          continue;
        }
        // Basic safeguard: prisma will error if relation doesn't exist; we keep minimal behavior per requirement
        include[relation] = true;
      }
    }
    return Object.keys(include).length > 0 ? include : undefined;
  }
}
