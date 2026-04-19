import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

// Admin DataTable config for publications
const config: DataTableConfig = {
  entity: 'publication',
  defaultSortBy: 'publishedAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 120,
      pinned: 'left',
    },
    {
      key: 'title',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 360,
    },
    {
      key: 'publishedAt',
      filterable: true,
      searchable: false,
      type: 'datetime',
      width: 200,
    },
    // foreign keys
    {
      key: 'authorId',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 160,
    },
    {
      key: 'channelId',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 160,
    },
    {
      key: 'statusId',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 160,
    },
  ],
};

@Injectable()
export class AdminPublicationsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  // Enforce only published publications in admin table
  async query(dto: DataTableQueryDto): Promise<DataTableResponseDto<any>> {
    const { page = 1, pageSize = 10, sortBy, sortDir, q } = this.normalizeQuery(
      dto,
    );

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const dynamicWhere = this.buildWhere(dto as any, q) as any;

    const publishedOnly = {
      status: { type: 'published' },
    } as const;

    let where: any;
    if (dynamicWhere && dynamicWhere.AND && Array.isArray(dynamicWhere.AND)) {
      where = { AND: [publishedOnly, ...dynamicWhere.AND] };
    } else if (dynamicWhere) {
      where = { AND: [publishedOnly, dynamicWhere] };
    } else {
      where = { ...publishedOnly };
    }

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
