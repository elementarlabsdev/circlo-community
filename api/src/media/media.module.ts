import { Global, Module } from '@nestjs/common';
import { StudioMediaController } from '@/media/infrastructure/controllers/studio.media.controller';
import { MediaItemsDataTableService } from '@/media/application/services/media-items-data-table.service';
import { MEDIA_ITEM_REPOSITORY } from '@/media/domain/repositories/media-item-repository.interface';
import { MediaItemsPrismaRepository } from '@/media/infrastructure/persistence/media-items.prisma.repository';
import { MEDIA_STAR_REPOSITORY } from '@/media/domain/repositories/media-star-repository.interface';
import { MediaStarsPrismaRepository } from '@/media/infrastructure/persistence/media-stars.prisma.repository';
import { AdminMediaController } from '@/media/infrastructure/controllers/admin.media.controller';
import { BullModule } from '@nestjs/bullmq';
import { VideoTranscoderService } from '@/media/application/services/video-transcoder.service';
import { VideoTranscodingProcessor } from '@/media/application/queue-processors/video-transcoding.processor';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video-transcoding',
    }),
  ],
  controllers: [AdminMediaController, StudioMediaController],
  providers: [
    MediaItemsDataTableService,
    VideoTranscoderService,
    VideoTranscodingProcessor,
    { provide: MEDIA_ITEM_REPOSITORY, useClass: MediaItemsPrismaRepository },
    { provide: MEDIA_STAR_REPOSITORY, useClass: MediaStarsPrismaRepository },
  ],
  exports: [
    MEDIA_ITEM_REPOSITORY,
    MEDIA_STAR_REPOSITORY,
    BullModule,
    VideoTranscoderService,
  ],
})
export class MediaModule {}
