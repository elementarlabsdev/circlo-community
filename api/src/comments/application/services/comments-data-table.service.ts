import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'comment',
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
      key: 'content',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 400,
    },
    {
      key: 'isHidden',
      filterable: true,
      searchable: false,
      type: 'boolean',
      width: 120,
    },
    {
      key: 'publication.title',
      filterable: false,
      searchable: false,
      type: 'relation',
      width: 300,
    },
    {
      key: 'repliesCount',
      filterable: true,
      searchable: false,
      type: 'number',
      width: 140,
    },
    {
      key: 'createdAt',
      filterable: true,
      searchable: false,
      type: 'datetime',
      width: 200,
    },
  ],
};

@Injectable()
export class CommentsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
