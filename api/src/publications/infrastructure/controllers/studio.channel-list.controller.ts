import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { Request } from '@/common/domain/interfaces/interfaces';

@Controller('studio/channel-list')
@UseGuards(AuthGuard)
export class StudioChannelListController {
  constructor(private _channelsService: ChannelsService) {}

  @Get()
  async index(
    @Req() request: Request,
    @Query('query') query = '',
    @Query('pageNumber') pageNumber = 1,
    @Query('pageSize') pageSize = 20,
  ) {
    const pagination = await this._channelsService.search(
      query,
      pageNumber,
      pageSize,
      request.user.id,
    );
    return {
      pagination,
    };
  }
}
