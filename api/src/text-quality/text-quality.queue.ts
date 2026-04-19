import { Injectable, Inject } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CACHE_MANAGER, Cache } from '@nestjs/cache-manager';

@Injectable()
export class TextQualityQueue {
  constructor(
    @InjectQueue('text-quality') private readonly queue: Queue,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  private async getOptions() {
    const isLoading = await this.cacheManager.get('text-quality:models-loading');
    return {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 5000,
      },
      delay: isLoading ? 60000 : 0, // Delay by 1 minute if models are loading
    };
  }

  async analyzePublication(id: string) {
    await this.queue.add('analyze-publication', { id }, await this.getOptions());
  }

  async analyzeComment(id: string) {
    await this.queue.add('analyze-comment', { id }, await this.getOptions());
  }

  async analyzeThread(id: string) {
    await this.queue.add('analyze-thread', { id }, await this.getOptions());
  }
}
