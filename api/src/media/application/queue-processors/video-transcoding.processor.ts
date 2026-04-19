import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { VideoTranscoderService } from '../services/video-transcoder.service';

@Processor('video-transcoding')
export class VideoTranscodingProcessor extends WorkerHost {
  constructor(private readonly transcoderService: VideoTranscoderService) {
    super();
  }

  async process(job: Job<{ mediaItemId: string }, any, string>): Promise<any> {
    const { mediaItemId } = job.data;
    // Transcoding is now done during upload in FileStorageService
    // This processor is kept for backward compatibility or if needed for re-transcoding
    // await this.transcoderService.transcodeToDash(mediaItemId);
  }
}
