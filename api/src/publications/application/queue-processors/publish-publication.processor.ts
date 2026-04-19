import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { PublicationsService } from '@/publications/application/services/publications.service';

@Processor('publication-queue')
export class PublishPublicationProcessor extends WorkerHost {
  constructor(private readonly publicationsService: PublicationsService) {
    super();
  }

  async process(job: Job<{ hash: string }>): Promise<any> {
    const { hash } = job.data;
    const draft = await this.publicationsService.findDraftByHash(hash);
    if (!draft) {
      return;
    }
    return await this.publicationsService.publish(draft);
  }
}
