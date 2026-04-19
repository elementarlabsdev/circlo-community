import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from './data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'announcement',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'id',
      filterable: true,
      searchable: false,
      type: 'string',
      width: 120,
    },
    {
      key: 'name',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 200,
    },
    {
      key: 'status',
      filterable: true,
      searchable: false,
      type: 'relation',
      width: 120,
    },
    {
      key: 'type',
      filterable: true,
      searchable: false,
      type: 'relation',
      width: 120,
    },
    {
      key: 'priority',
      filterable: true,
      searchable: false,
      type: 'number',
      width: 100,
    },
    {
      key: 'createdAt',
      filterable: true,
      searchable: false,
      type: 'datetime',
      width: 200,
    },
    {
        key: 'startAt',
        filterable: true,
        searchable: false,
        type: 'datetime',
        width: 200,
    },
    {
        key: 'endAt',
        filterable: true,
        searchable: false,
        type: 'datetime',
        width: 200,
    }
  ],
};

@Injectable()
export class AnnouncementDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
