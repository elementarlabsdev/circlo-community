import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DataTableService } from './data-table.service';
import { DataTableConfig } from '@/platform/application/dtos/datatable-dto';

const config: DataTableConfig = {
  entity: 'role',
  defaultSortBy: 'name',
  defaultSortDir: 'asc',
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
      key: 'type',
      filterable: true,
      searchable: true,
      type: 'string',
      width: 180,
    },
    {
      key: 'isBuiltIn',
      filterable: true,
      searchable: false,
      type: 'boolean',
      width: 120,
    },
  ],
};

@Injectable()
export class RoleDataTableService extends DataTableService<any> {
  constructor(prisma: PrismaService) {
    super(prisma, config);
  }
}
