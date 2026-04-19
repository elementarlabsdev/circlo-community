import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'menu',
  defaultSortBy: 'createdAt',
  defaultSortDir: 'desc',
  columns: [
    {
      key: 'name',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 260,
    },
    {
      key: 'type',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 180,
    },
    {
      key: 'position',
      filterable: true,
      searchable: false,
      type: 'number',
      width: 120,
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
export class MenusDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
