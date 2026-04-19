import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

// Admin DataTable config for complaints
const config: DataTableConfig = {
  entity: 'complaint',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    { key: 'id', type: 'string', filterable: true, searchable: false, width: 140, pinned: 'left' },
    { key: 'targetType', type: 'string', filterable: true, searchable: true, width: 140 },
    { key: 'targetId', type: 'string', filterable: true, searchable: true, width: 220 },
    // foreign keys -> auto include relations (reporter, reason)
    { key: 'reporterId', type: 'string', filterable: true, searchable: false, width: 160 },
    // explicit relations for convenience on UI
    { key: 'reporter', type: 'relation', filterable: false, searchable: false, width: 220 },
    { key: 'reason', type: 'relation', filterable: false, searchable: false, width: 180 },
    { key: 'details', type: 'string', filterable: true, searchable: true, width: 400 },
    { key: 'createdAt', type: 'datetime', filterable: true, searchable: false, width: 200 },
    { key: 'updatedAt', type: 'datetime', filterable: true, searchable: false, width: 200 },
  ],
};

@Injectable()
export class AdminComplaintsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
