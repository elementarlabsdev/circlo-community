import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

// Studio DataTable config for publications (can include drafts, scheduled, etc.)
const config: DataTableConfig = {
  entity: 'publication',
  defaultSortBy: 'updatedAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 120,
      pinned: 'left',
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
      key: 'author',
      type: 'relation',
      filterable: false,
      searchable: false,
    },
    {
      key: 'channelId',
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
export class StudioPublicationsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  // Studio table must show only publications for current user
  async query(
    dto: DataTableQueryDto,
    context: any,
  ): Promise<DataTableResponseDto<any>> {
    const {
      page = 1,
      pageSize = 10,
      sortBy,
      sortDir,
      q,
    } = this.normalizeQuery(dto);

    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const dynamicWhere = this.buildWhere(dto as any, q) as any;

    const filters = { authorId: context.id } as const;

    let where: any;
    if (dynamicWhere && dynamicWhere.AND && Array.isArray(dynamicWhere.AND)) {
      where = { AND: [filters, ...dynamicWhere.AND] };
    } else if (dynamicWhere) {
      where = { AND: [filters, dynamicWhere] };
    } else {
      where = { ...filters };
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
