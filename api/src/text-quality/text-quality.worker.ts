import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { TextQualityService } from './text-quality.service';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Processor('text-quality', {
  concurrency: 2, // Поддерживаем многопоточность для ускорения анализа
})
export class TextQualityWorker extends WorkerHost {
  private readonly logger = new Logger(TextQualityWorker.name);

  constructor(
    private readonly textQualityService: TextQualityService,
    private readonly prisma: PrismaService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    const { id } = job.data;

    try {
      switch (job.name) {
        case 'analyze-publication':
          await this.processPublication(id);
          break;
        case 'analyze-comment':
          await this.processComment(id);
          break;
        case 'analyze-thread':
          await this.processThread(id);
          break;
        default:
          this.logger.warn(`Unknown job name: ${job.name}`);
      }
    } catch (error) {
      this.logger.error(`Failed to process job ${job.id}: ${error.message}`, error.stack);
      throw error;
    }
  }

  private async processPublication(id: string) {
    const publication = await this.prisma.publication.findUnique({
      where: { id },
      select: { textContent: true },
    });

    if (!publication) return;

    const score = await this.textQualityService.analyze(publication.textContent);
    await this.prisma.publication.update({
      where: { id },
      data: { qualityScore: score as any },
    });
  }

  private async processComment(id: string) {
    const comment = await this.prisma.comment.findUnique({
      where: { id },
      select: { textContent: true },
    });

    if (!comment) return;

    const score = await this.textQualityService.analyze(comment.textContent);
    await this.prisma.comment.update({
      where: { id },
      data: { qualityScore: score as any },
    });
  }

  private async processThread(id: string) {
    const thread = await this.prisma.thread.findUnique({
      where: { id },
      select: { textContent: true },
    });

    if (!thread) return;

    const score = await this.textQualityService.analyze(thread.textContent);
    await this.prisma.thread.update({
      where: { id },
      data: { qualityScore: score as any },
    });
  }
}
