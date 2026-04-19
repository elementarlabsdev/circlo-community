import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SendEmailUseCase } from '@/mail/application/use-cases/send-email.use-case';

@Processor('email-queue', { concurrency: 100 })
export class SendEmailProcessor extends WorkerHost {
  constructor(private readonly sendEmailUseCase: SendEmailUseCase) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    await this.sendEmailUseCase.execute(job.data);
  }
}
