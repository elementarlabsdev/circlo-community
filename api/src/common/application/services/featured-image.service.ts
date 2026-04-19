import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MediaItem, User } from '@prisma/client';
import { FileStorageService } from '@/platform/application/services/file-storage.service';

@Injectable()
export class FeaturedImageService {
  constructor(
    private _prisma: PrismaService,
    private _fileStorageService: FileStorageService,
  ) {}

  async create(
    uploadedFile: Express.Multer.File,
    uploadedBy: User,
  ): Promise<MediaItem> {
    return this._fileStorageService.save(uploadedFile, uploadedBy);
  }

  async delete(featuredImage: MediaItem): Promise<void> {
    await this._prisma.mediaItem.update({
      where: {
        id: featuredImage.id,
      },
      data: {
        deleted: true,
      },
    });
  }
}
