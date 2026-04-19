import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { ChannelsService } from '@/channels/application/services/channels.service';
import { CreateChannelDto } from '@/channels/application/dto/create-channel.dto';
import { Request } from '@/common/domain/interfaces/interfaces';
import { ChannelSlugValidateDto } from '@/channels/application/dto/channel-slug-validate.dto';

@Controller('studio/channels')
@UseGuards(AuthGuard)
export class StudioChannelsController {
  constructor(private readonly _channelsService: ChannelsService) {}

  @Get('visibilities')
  async getVisibilities() {
    const visibilities = await this._channelsService.findVisibilities();
    return { visibilities };
  }

  @Get()
  async getMyChannels(@Req() request: Request) {
    const channels = await this._channelsService.findByOwner(request.user.id);
    return { channels };
  }

  @Post()
  async create(@Req() request: Request, @Body() channelDto: CreateChannelDto) {
    const channel = await this._channelsService.create(
      request.user.id,
      channelDto,
    );
    return { channelId: channel.id };
  }

  @Put(':id')
  async update(
    @Req() request: Request,
    @Param('id') id: string,
    @Body() channelDto: CreateChannelDto,
  ) {
    await this._channelsService.update(request.user.id, id, channelDto);
    return {};
  }

  @Delete(':id')
  async delete(@Req() request: Request, @Param('id') id: string) {
    await this._channelsService.delete(request.user.id, id);
    return {};
  }

  @Get(':id')
  async getOne(@Req() request: Request, @Param('id') id: string) {
    const channel = await this._channelsService.findOneByOwner(id, request.user.id);
    return { channel };
  }

  @Post('slug/validate')
  async slugValidate(@Body() slugValidateDto: ChannelSlugValidateDto) {
    const invalid = await this._channelsService.uniqueSlugValidate(
      slugValidateDto.slug,
      slugValidateDto.channelId,
    );
    return { invalid };
  }
}
