import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { StudioMediaUploadPipe } from '@/common/infrastructure/validators/studio-media-upload.pipe';
import { DataTableQueryDto } from '@/platform/application/dtos/datatable-dto';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { MediaViewDto } from '@/media/application/dtos/media-view.dto';
import { ListStudioMediaUseCase } from '@/media/application/use-cases/list-studio-media.use-case';
import { QueryStudioMediaTableUseCase } from '@/media/application/use-cases/query-studio-media-table.use-case';
import { SaveMediaViewUseCase } from '@/media/application/use-cases/save-media-view.use-case';
import { UploadStudioMediaUseCase } from '@/media/application/use-cases/upload-studio-media.use-case';
import { DownloadStudioMediaUseCase } from '@/media/application/use-cases/download-studio-media.use-case';
import { DeleteStudioMediaUseCase } from '@/media/application/use-cases/delete-studio-media.use-case';

@Controller('studio/media')
@UseGuards(AuthGuard)
export class StudioMediaController {
  constructor(
    private readonly listUseCase: ListStudioMediaUseCase,
    private readonly queryTableUseCase: QueryStudioMediaTableUseCase,
    private readonly saveViewUseCase: SaveMediaViewUseCase,
    private readonly uploadUseCase: UploadStudioMediaUseCase,
    private readonly downloadUseCase: DownloadStudioMediaUseCase,
    private readonly deleteUseCase: DeleteStudioMediaUseCase,
  ) {}

  @Get('list')
  async list(@Req() req: any) {
    return await this.listUseCase.execute(req.user.id, req.user.mediaView);
  }

  @Post('table')
  async table(@Req() req: any, @Body() dto: DataTableQueryDto) {
    return await this.queryTableUseCase.execute(dto, req.user.id);
  }

  @Post('view')
  async saveView(@Req() req: any, @Body() dto: MediaViewDto) {
    return await this.saveViewUseCase.execute(req.user.id, dto);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: any,
    @UploadedFile(StudioMediaUploadPipe) uploadedFile: Express.Multer.File,
  ) {
    return await this.uploadUseCase.execute(req.user, uploadedFile);
  }

  @Post('download')
  async zip(
    @Req() req: any,
    @Res() res: Response,
    @Body() body: { ids: string[] },
  ) {
    return await this.downloadUseCase.execute(req.user.id, body.ids, res);
  }

  @Post('delete')
  async deleteSelected(@Req() req: any, @Body() body: { ids: string[] }) {
    return await this.deleteUseCase.execute(req.user.id, body.ids);
  }
}
