import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';
import { Request } from '@/common/domain/interfaces/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { FEATURED_IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/featured-image-upload.pipe-builder';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { PagesDataTableService } from '@/pages/application/services/pages-data-table.service';
import { PageListService } from '@/pages/application/services/page-list.service';
import { PageContentDto } from '@/pages/application/dtos/page-content.dto';
import { PageSettingsDto } from '@/pages/application/dtos/page-settings.dto';

@Controller('admin/pages')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminPagesController {
  constructor(
    private _pageListService: PageListService,
    private readonly pagesTable: PagesDataTableService,
  ) {}

  @Get(':hash')
  @CheckAbilities([Action.Read, 'PageEntity'])
  async getPage(@Param('hash') hash: string) {
    const page = await this._pageListService.findDraftByHash(hash);
    return {
      page,
    };
  }

  @Post('create-new')
  @CheckAbilities([Action.Create, 'PageEntity'])
  async createNew(@Req() request: Request) {
    const page = await this._pageListService.createDraft(request.user);
    return {
      page: {
        hash: page.hash,
      },
    };
  }

  @Post('table')
  @CheckAbilities([Action.Read, 'PageEntity'])
  async table(@Body() dto: DataTableQueryDto) {
    return await this.pagesTable.query(dto);
  }

  @Post('bulk-unpublish')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async bulkUnpublish(@Body('ids') ids: string[]) {
    await this._pageListService.bulkUnpublish(ids);
    return {};
  }

  @Post(':id/unpublish')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async unpublish(@Param('id') id: string) {
    await this._pageListService.unpublish(id);
    return {};
  }

  @Post(':id/restore')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async restore(@Param('id') id: string) {
    await this._pageListService.restore(id);
    return {};
  }

  @Delete('bulk-delete')
  @CheckAbilities([Action.Delete, 'PageEntity'])
  async bulkDelete(@Body('ids') ids: string[]) {
    await this._pageListService.bulkDelete(ids);
    return {};
  }

  @Delete(':id/delete')
  @CheckAbilities([Action.Delete, 'PageEntity'])
  async delete(@Param('id') id: string) {
    await this._pageListService.delete(id);
    return {};
  }

  @Delete(':id/bulk-force-delete')
  @CheckAbilities([Action.Delete, 'PageEntity'])
  async bulkForceDelete(@Param('ids') ids: string[]) {
    await this._pageListService.bulkForceDelete(ids);
    return {};
  }

  @Delete(':id/force-delete')
  @CheckAbilities([Action.Delete, 'PageEntity'])
  async forceDelete(@Param('id') id: string) {
    await this._pageListService.forceDelete(id);
    return {};
  }

  @Get(':hash/content')
  @CheckAbilities([Action.Read, 'PageEntity'])
  async content(@Param('hash') hash: string) {
    const page = await this._pageListService.findDraftByHash(hash);
    return {
      page,
    };
  }

  @Post(':hash/content')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async saveContent(
    @Param('hash') hash: string,
    @Body() pageContentDto: PageContentDto,
  ) {
    const page = await this._pageListService.saveContent(hash, pageContentDto);
    return {
      page,
    };
  }

  @Get(':hash/settings')
  @CheckAbilities([Action.Read, 'PageEntity'])
  async edit(@Param('hash') hash: string) {
    const page = await this._pageListService.findDraftByHash(hash);
    return {
      page,
    };
  }

  @Post(':hash/settings')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async save(
    @Param('hash') hash: string,
    @Body() pageSettingsDto: PageSettingsDto,
  ) {
    const page = await this._pageListService.saveSettings(
      hash,
      pageSettingsDto,
    );
    return {
      page,
    };
  }

  @Post(':hash/publish')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async publish(@Param('hash') hash: string) {
    let draft = await this._pageListService.findDraftByHash(hash);
    draft = await this._pageListService.publish(draft);
    return {
      page: draft,
    };
  }

  @Post(':hash/featured-image')
  @CheckAbilities([Action.Update, 'PageEntity'])
  @UseInterceptors(FileInterceptor('image'))
  async addFeaturedImage(
    @Req() req: any,
    @Param('hash') hash: string,
    @UploadedFile(FEATURED_IMAGE_UPLOAD_PIPE_BUILDER)
    image: Express.Multer.File,
  ) {
    const page = await this._pageListService.findDraftByHash(hash);
    return {
      page: await this._pageListService.addFeaturedImage(page, image, req.user),
    };
  }

  @Delete(':hash/featured-image')
  @CheckAbilities([Action.Update, 'PageEntity'])
  async deleteFeaturedImage(@Param('hash') hash: string) {
    const page = await this._pageListService.findDraftByHash(hash);
    return {
      page: await this._pageListService.deleteFeaturedImage(page),
    };
  }

  @Post(':hash/upload/image')
  @CheckAbilities([Action.Update, 'PageEntity'])
  @UseInterceptors(FileInterceptor('image'))
  async addImage(
    @Req() req: any,
    @Param('hash') hash: string,
    @UploadedFile(FEATURED_IMAGE_UPLOAD_PIPE_BUILDER)
    image: Express.Multer.File,
  ) {
    const draft = await this._pageListService.findDraftByHash(hash);
    const { file, page } = await this._pageListService.addImage(
      draft,
      image,
      req.user,
    );
    return {
      success: true,
      file: {
        url: file.url,
      },
      page,
    };
  }
}
