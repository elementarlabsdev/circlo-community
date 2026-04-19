import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'topic',
  defaultSortBy: 'name',
  defaultSortDir: 'asc',
  columns: [
    { key: 'id', filterable: true, searchable: false, type: 'string', width: 120, pinned: 'left' },
    { key: 'name', filterable: true, searchable: true, type: 'string', width: 240 },
    { key: 'followersCount', filterable: true, searchable: false, type: 'number', width: 160 },
    { key: 'publicationsCount', filterable: true, searchable: false, type: 'number', width: 180 },
  ],
};

@Injectable()
export class TopicsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
