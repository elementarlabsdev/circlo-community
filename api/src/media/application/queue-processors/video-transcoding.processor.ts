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
    await this.transcoderService.transcodeToDash(mediaItemId);
  }
}
