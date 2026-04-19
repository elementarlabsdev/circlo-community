import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { TutorialsService } from '@/tutorials/application/services/tutorials.service';

@Processor('tutorial-queue')
export class PublishTutorialProcessor extends WorkerHost {
  constructor(private readonly tutorialsService: TutorialsService) {
    super();
  }

  async process(job: Job<{ id: string }>): Promise<any> {
    const { id } = job.data;
    const tutorial = await this.tutorialsService.getTutorialById(id);
    if (!tutorial) {
      return;
    }
    return await this.tutorialsService.publishTutorial(id, { id: tutorial.authorId } as any);
  }
}
