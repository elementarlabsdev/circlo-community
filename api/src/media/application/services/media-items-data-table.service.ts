import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'mediaItem',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
      pinned: 'left',
    },
    {
      key: 'name',
      type: 'string',
      filterable: true,
      searchable: true,
      width: 280,
    },
    {
      key: 'extension',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 120,
    },
    {
      key: 'mimeType',
      type: 'string',
      filterable: true,
      searchable: true,
      width: 220,
    },
    {
      key: 'size',
      type: 'number',
      filterable: true,
      searchable: false,
      width: 140,
    },
    {
      key: 'category',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    // expose uploader for admin table; auto-includes relation via foreign key
    {
      key: 'uploadedById',
      type: 'string',
      filterable: true,
      searchable: true,
      width: 240,
    },
    {
      key: 'url',
      type: 'string',
      filterable: false,
      searchable: false,
      width: 320,
    },
    {
      key: 'createdAt',
      type: 'datetime',
      filterable: true,
      searchable: false,
      width: 200,
    },
  ],
};

@Injectable()
export class MediaItemsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  async queryForUser(
    dto: DataTableQueryDto,
    userId: string,
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

    const userScope = { uploadedBy: { id: userId } } as const;

    let where: any;
    if (dynamicWhere && dynamicWhere.AND && Array.isArray(dynamicWhere.AND)) {
      where = { AND: [userScope, ...dynamicWhere.AND] };
    } else if (dynamicWhere) {
      where = { AND: [userScope, dynamicWhere] };
    } else {
      where = { ...userScope };
    }

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
}
