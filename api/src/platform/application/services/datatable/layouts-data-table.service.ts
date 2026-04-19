import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'layout',
  defaultSortBy: 'position',
  defaultSortDir: 'asc',
  columns: [
    {
      key: 'id',
      type: 'string',
      filterable: true,
      searchable: false,
      width: 160,
    },
    {
      key: 'name',
      type: 'string',
      filterable: true,
      searchable: true,
      width: 300,
    },
    {
      key: 'position',
      type: 'number',
      filterable: true,
      searchable: false,
      width: 120,
    },
  ],
};

@Injectable()
export class LayoutsDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
