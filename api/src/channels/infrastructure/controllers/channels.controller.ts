import {
  Controller,
  DefaultValuePipe,
  Get,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { Request } from '@/common/domain/interfaces/interfaces';
import { ChannelListService } from '@/channels/application/services/channel-list.service';

@Controller()
export class ChannelsController {
  constructor(private readonly channelListService: ChannelListService) {}

  // GET /channels — latest channels list
  @Get('channels')
  async getLatestChannels(
    @Req() request: Request,
    @Query('pageNumber', new DefaultValuePipe(1), ParseIntPipe)
    pageNumber: number = 1,
  ) {
    return await this.channelListService.getLatest(request.user, pageNumber);
  }
}
