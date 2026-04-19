import { Injectable } from '@nestjs/common';
import { FileStorageService } from '@/platform/application/services/file-storage.service';

@Injectable()
export class UploadAvatarUseCase {
  constructor(private readonly fileStorageService: FileStorageService) {}

  async execute(user: any, uploadedFile: Express.Multer.File): Promise<{ url: string }> {
    const file = await this.fileStorageService.save(uploadedFile, user);
    return { url: file.url };
  }
}
