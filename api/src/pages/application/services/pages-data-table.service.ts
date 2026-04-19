import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'page',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'title',
      type: 'string',
      filterable: true,
      searchable: true,
      width: 360,
    },
    {
      key: 'createdAt',
      type: 'datetime',
      filterable: true,
      searchable: false,
      width: 200,
    },
    {
      key: 'updatedAt',
      type: 'datetime',
      filterable: true,
      searchable: false,
      width: 200,
    },
    {
      key: 'publishedAt',
      type: 'datetime',
      filterable: true,
      searchable: false,
      width: 200,
    },
    {
      key: 'authorId',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'statusId',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
  ],
};

@Injectable()
export class PagesDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  // Allow all pages in admin table
  async query(dto: DataTableQueryDto): Promise<DataTableResponseDto<any>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortDir,
      q,
    } = this.normalizeQuery(dto);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const where = this.buildWhere(dto as any, q) as any;

    const orderBy = this.buildOrderBy(sortBy, sortDir);

    const delegate = (this.prisma as any)[this.config.entity];
    if (!delegate) {
      throw new Error(
        `Prisma delegate not found for entity: ${this.config.entity}`,
      );
    }

    const include = this.buildIncludeFromForeignKeys();

    const [total, data] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({ where, orderBy, skip, take, include }),
    ]);

    return { data, total, page, pageSize };
  }
}
