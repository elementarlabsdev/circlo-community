import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { RecommendationService } from '../services/recommendation.service';

@Processor('recommendation-queue')
export class RecommendationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationProcessor.name);

  constructor(private readonly recommendationService: RecommendationService) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.debug(
      `Processing job ${job.id} of name ${job.name} with data: ${JSON.stringify(
        job.data,
      )}`,
    );
    switch (job.name) {
      case 'update-user-interests':
        const { userId, targetId, targetType } = job.data;
        this.logger.debug(
          `Updating interests for user ${userId} based on ${targetType} ${targetId}`,
        );
        await this.recommendationService.updateUserInterests(
          userId,
          targetId,
          targetType,
        );
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }
}
