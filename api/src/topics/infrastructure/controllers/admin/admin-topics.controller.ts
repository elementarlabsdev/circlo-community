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
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { AdminTopicListService } from '@/topics/application/services/admin-topic-list.service';
import { TopicDto } from '@/topics/application/dto/topic.dto';
import { TopicSlugValidateDto } from '@/topics/application/dto/topic-slug-validate.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { DataTableService } from '@/platform/application/services/datatable/data-table.service';

@UseGuards(AuthGuard, AbilitiesGuard)
@Controller('admin/topics')
export class AdminTopicsController {
  constructor(
    private readonly topicsTableService: DataTableService,
    private readonly topicListService: AdminTopicListService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post('table')
  @CheckAbilities([Action.Read, 'TopicEntity'])
  async list(@Body() dto: DataTableQueryDto) {
    return await this.topicsTableService.query(dto);
  }

  // POST admin/topics
  @Post()
  @CheckAbilities([Action.Create, 'TopicEntity'])
  async create(@Body() topicDto: TopicDto) {
    return { topic: await this.topicListService.createNew(topicDto) };
  }

  // GET admin/topics/:id/edit
  @Get(':id/edit')
  @CheckAbilities([Action.Read, 'TopicEntity'])
  async getOne(@Param('id') id: string) {
    return { topic: await this.topicListService.findOneById(id) };
  }

  // PUT admin/topics/:id
  @Put(':id')
  @CheckAbilities([Action.Update, 'TopicEntity'])
  async update(@Param('id') id: string, @Body() topicDto: TopicDto) {
    await this.topicListService.save(id, topicDto);
    return {};
  }

  // DELETE admin/topics/:id
  @Delete(':id')
  @CheckAbilities([Action.Delete, 'TopicEntity'])
  async delete(@Param('id') id: string) {
    await this.topicListService.delete(id);
    return {};
  }

  // DELETE admin/topics/bulk-delete
  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'TopicEntity'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this.topicListService.bulkDelete(ids);
    return {};
  }

  // POST admin/topics/slug/validate
  @Post('slug/validate')
  @CheckAbilities([Action.Read, 'TopicEntity'])
  async slugValidate(@Body() dto: TopicSlugValidateDto) {
    const invalid = await this.topicListService.slugValidate(
      dto.slug,
      dto.topicId,
    );
    return { invalid };
  }

  // POST admin/topics/logo/upload
  @Post('logo/upload')
  @CheckAbilities([Action.Update, 'TopicEntity'])
  @UseInterceptors(FileInterceptor('image'))
  async logoUpload(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this.fileStorageService.save(uploadedFile, req.user);
    return { file };
  }
}
