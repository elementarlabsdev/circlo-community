import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'channel',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    { key: 'id', filterable: true, searchable: false, type: 'string', width: 120, pinned: 'left' },
    { key: 'name', filterable: true, searchable: true, type: 'string', width: 240 },
    { key: 'slug', filterable: true, searchable: true, type: 'string', width: 220 },
    { key: 'followersCount', filterable: true, searchable: false, type: 'number', width: 160 },
    { key: 'publicationsCount', filterable: true, searchable: false, type: 'number', width: 180 },
    { key: 'createdAt', filterable: true, searchable: false, type: 'datetime', width: 200 },
  ],
};

@Injectable()
export class ChannelsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
