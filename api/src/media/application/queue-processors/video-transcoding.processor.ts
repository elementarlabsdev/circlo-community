import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { VideoTranscoderService } from '../services/video-transcoder.service';

@Processor('video-transcoding')
export class VideoTranscodingProcessor extends WorkerHost {
  private readonly logger = new Logger(VideoTranscodingProcessor.name);

  constructor(private readonly transcoderService: VideoTranscoderService) {
    super();
  }

  async process(job: Job<{ mediaItemId: string }, any, string>): Promise<any> {
    const { mediaItemId } = job.data;
    this.logger.log(
      `Processing video transcoding job for media item: ${mediaItemId}`,
    );
    try {
      await this.transcoderService.transcodeToHls(mediaItemId);
      this.logger.log(
        `Video transcoding job completed for media item: ${mediaItemId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to process video transcoding job for media item: ${mediaItemId}. Error: ${error.message}`,
      );
      throw error;
    }
  }
}
