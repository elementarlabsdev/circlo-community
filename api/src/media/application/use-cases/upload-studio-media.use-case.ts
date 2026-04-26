import { Injectable } from '@nestjs/common';
import { FileStorageService } from '@/platform/application/services/file-storage.service';

@Injectable()
export class UploadStudioMediaUseCase {
  constructor(private readonly fileStorage: FileStorageService) {}

  async execute(user: any, uploadedFile: Express.Multer.File) {
    const file = await this.fileStorage.save(uploadedFile, user);
    return {
      file,
    };
  }
}
