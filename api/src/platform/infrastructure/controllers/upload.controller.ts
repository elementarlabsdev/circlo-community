import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { IMAGE_UPLOAD_PIPE_BUILDER } from '@/common/infrastructure/validators/profile-avatar-upload.pipe-builder';

@Controller('upload')
@UseGuards(AuthGuard)
export class UploadController {
  constructor(private _fileStorage: FileStorageService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('image'))
  async image(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this._fileStorage.save(uploadedFile, req.user);
    return {
      url: file.url,
    };
  }

  @Post('comment/image')
  @UseInterceptors(FileInterceptor('image'))
  async commentImage(
    @Req() req: any,
    @UploadedFile(IMAGE_UPLOAD_PIPE_BUILDER) uploadedFile: Express.Multer.File,
  ) {
    const file = await this._fileStorage.save(uploadedFile, req.user);
    return {
      url: file.url,
    };
  }
}
