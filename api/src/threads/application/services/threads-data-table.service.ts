import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'thread',
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
      key: 'textContent',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 400,
    },
    {
      key: 'qualityScore',
      filterable: true,
      searchable: false,
      type: 'number',
      width: 180,
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
export class ThreadsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
