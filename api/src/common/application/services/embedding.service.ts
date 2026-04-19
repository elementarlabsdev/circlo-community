import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { pipeline, env } from '@huggingface/transformers';
import { join } from 'path';

@Injectable()
export class EmbeddingService implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingService.name);
  private extractor: any;

  async onModuleInit() {
    try {
      this.logger.log('Initializing embedding model...');
      env.cacheDir = join(process.cwd(), 'temp');
      this.extractor = await pipeline(
        'feature-extraction',
        'Xenova/paraphrase-multilingual-MiniLM-L12-v2',
        {
          dtype: 'fp32',
          device: 'cpu',
        },
      );
      this.logger.log('Embedding model initialized successfully');
    } catch (error) {
      this.logger.error(`Failed to initialize embedding model: ${error.message}`, error.stack);
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      if (!this.extractor) {
        this.logger.warn('Extractor not initialized, attempting to initialize...');
        await this.onModuleInit();
      }

      if (!text || text.trim().length === 0) {
        return new Array(384).fill(0);
      }

      const output = await this.extractor(text, {
        pooling: 'mean',
        normalize: true,
      });
      return Array.from(output.data);
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw error;
    }
  }
}
