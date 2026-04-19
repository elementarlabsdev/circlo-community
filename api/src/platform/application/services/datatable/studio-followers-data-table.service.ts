import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import {
  DataTableConfig,
  DataTableQueryDto,
  DataTableResponseDto,
} from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'subscription',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 120,
    },
    {
      key: 'createdAt',
      type: 'datetime',
      filterable: true,
      searchable: false,
      width: 200,
    },
    {
      key: 'followerId',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'targetId',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'targetType',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'follower',
      type: 'relation',
      filterable: false,
      searchable: true, // We want to search by follower name/username
    }
  ],
};

@Injectable()
export class StudioFollowersDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }

  async queryCustom(dto: DataTableQueryDto, targetId: string): Promise<DataTableResponseDto<any>> {
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

    const targetFilter = { targetId, targetType: 'user' } as const;

    let where: any;
    if (dynamicWhere && dynamicWhere.AND && Array.isArray(dynamicWhere.AND)) {
      where = { AND: [targetFilter, ...dynamicWhere.AND] };
    } else if (dynamicWhere) {
      where = { AND: [targetFilter, dynamicWhere] };
    } else {
      where = { ...targetFilter };
    }

    // Special handling for global search in follower name/username
    if (q) {
      const searchFilter = {
        OR: [
          { follower: { name: { contains: q, mode: 'insensitive' } } },
          { follower: { username: { contains: q, mode: 'insensitive' } } },
        ],
      };
      if (where.AND) {
        where.AND.push(searchFilter);
      } else {
        where = { AND: [where, searchFilter] };
      }
    }

    const orderBy = this.buildOrderBy(sortBy, sortDir);

    const delegate = (this.prisma as any)[this.config.entity];

    const [total, data] = await Promise.all([
      delegate.count({ where }),
      delegate.findMany({
        where,
        orderBy,
        skip,
        take,
        include: {
          follower: {
            include: {
              avatar: true
            }
          }
        }
      }),
    ]);

    const items = await Promise.all(data.map(async (item: any) => {
      const isFollowing = await (this.prisma as any).subscription.count({
        where: {
          followerId: targetId,
          targetId: item.followerId,
          targetType: 'user'
        }
      });
      return {
        ...item,
        isFollowing: !!isFollowing
      };
    }));

    return { data: items, total, page, pageSize };
  }
}
