import { Global, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TextQualityService } from './text-quality.service';
import { TextQualityQueue } from './text-quality.queue';
import { TextQualityWorker } from './text-quality.worker';

@Global()
@Module({
  imports: [
    BullModule.registerQueue({
      name: 'text-quality',
    }),
  ],
  providers: [TextQualityService, TextQualityQueue, TextQualityWorker],
  exports: [TextQualityService, TextQualityQueue, TextQualityWorker],
})
export class TextQualityModule {}
