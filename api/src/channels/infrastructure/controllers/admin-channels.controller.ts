import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AdminChannelListService } from '@/channels/application/services/admin-channel-list.service';
import { CreateChannelDto } from '@/channels/application/dto/create-channel.dto';
import { ChannelSlugValidateDto } from '@/channels/application/dto/channel-slug-validate.dto';

@ApiTags('admin')
@Controller('admin/channels')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminChannelsController {
  constructor(
    private readonly _channelsTableService: DataTableService,
    private readonly _channelListService: AdminChannelListService,
    private readonly _fileStorageService: FileStorageService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'ChannelEntity'])
  async list(@Body() dto: DataTableQueryDto) {
    return await this._channelsTableService.query(dto);
  }

  @Post('create')
  @CheckAbilities([Action.Create, 'ChannelEntity'])
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
  })
  async createNew(@Body() channelDto: CreateChannelDto) {
    const channel = await this._channelListService.createNew(channelDto);
    return { channelId: channel.id };
  }

  @Put(':id')
  @CheckAbilities([Action.Update, 'ChannelEntity'])
  async save(@Param('id') id: string, @Body() channelDto: CreateChannelDto) {
    await this._channelListService.save(id, channelDto);
    return {};
  }

  @Get(':id')
  @CheckAbilities([Action.Read, 'ChannelEntity'])
  async getOne(@Param('id') id: string) {
    const channel = await this._channelListService.findOneById(id);
    return { channel };
  }

  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'ChannelEntity'])
  async delete(@Param('id') id: string) {
    await this._channelListService.delete(id);
    return {};
  }

  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'ChannelEntity'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this._channelListService.bulkDelete(ids);
    return {};
  }

  @Post('slug/validate')
  @CheckAbilities([Action.Read, 'ChannelEntity'])
  async slugValidate(@Body() slugValidateDto: ChannelSlugValidateDto) {
    const invalid = await this._channelListService.slugValidate(
      slugValidateDto.slug,
      slugValidateDto.channelId,
    );
    return { invalid };
  }

  @Post('logo/upload')
  @CheckAbilities([Action.Update, 'ChannelEntity'])
  @UseInterceptors(FileInterceptor('image'))
  async logoUpload(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this._fileStorageService.save(uploadedFile, req);
    return { file };
  }

  @Get('visibilities')
  @CheckAbilities([Action.Read, 'ChannelEntity'])
  async getVisibilities() {
    const visibilities = await this._channelListService.findVisibilities();
    return { visibilities };
  }
}
