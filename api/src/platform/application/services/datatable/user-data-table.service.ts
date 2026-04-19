import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from './data-table.service';
import { DataTableConfig, DataTableQueryDto, DataTableResponseDto } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'user',
  defaultSortBy: 'createdAt',
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
      key: 'name',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 200,
    },
    {
      key: 'username',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 180,
    },
    {
      key: 'email',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 260,
    },
    {
      key: 'createdAt',
      filterable: true,
      searchable: false,
      type: 'datetime',
      width: 200,
    },
    {
      key: 'isBlocked',
      filterable: true,
      searchable: false,
      type: 'boolean',
      width: 140,
    },
    {
      key: 'verified',
      filterable: true,
      searchable: false,
      type: 'boolean',
      width: 140,
    },
    {
      key: 'isSuperAdmin',
      filterable: true,
      searchable: false,
      type: 'boolean',
      width: 160,
      pinned: 'right',
    },
  ],
};

@Injectable()
export class UserDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  override async query(
    dto: DataTableQueryDto,
    context?: any,
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
      (this.prisma as any).$extends({
        query: {
          user: {
            findMany({ args, query }: any) {
              args.omit = { ...args.omit, email: false };
              return query(args);
            },
          },
        },
      }).user.findMany({
        where,
        orderBy,
        skip,
        take,
        include,
      }),
    ]);

    return { data, total, page, pageSize };
  }
}
