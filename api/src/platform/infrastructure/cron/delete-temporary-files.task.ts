import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subMonths } from 'date-fns';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FileStorageService } from '@/platform/application/services/file-storage.service';

@Injectable()
export class DeleteTemporaryFilesTask {
  constructor(
    private _prismaService: PrismaService,
    private _fileStorageService: FileStorageService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron() {
    const itemsToDelete = await this._prismaService.mediaItem.findMany({
      where: {
        OR: [
          {
            deleted: true,
            createdAt: {
              lt: subMonths(new Date(), 1),
            },
          },
          {
            temporary: true,
            createdAt: {
              lt: subMonths(new Date(), 1),
            },
          },
        ],
      },
      include: {
        fileStorageProvider: true,
      },
    });

    for (const item of itemsToDelete) {
      await this._fileStorageService.deleteMediaItem(item);
      await this._prismaService.mediaItem.delete({
        where: { id: item.id },
      });
    }
  }
}
