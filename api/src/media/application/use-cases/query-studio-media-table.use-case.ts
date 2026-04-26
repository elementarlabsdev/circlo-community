import { Injectable } from '@nestjs/common';
import { MediaItemsDataTableService } from '@/media/application/services/media-items-data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';

@Injectable()
export class QueryStudioMediaTableUseCase {
  constructor(private readonly mediaDataTable: MediaItemsDataTableService) {}

  async execute(dto: DataTableQueryDto, userId: string) {
    return await this.mediaDataTable.queryForUser(dto, userId);
  }
}
