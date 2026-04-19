import { Controller, Post, Param, Get } from '@nestjs/common';
import { RecommendationService } from '@/common/application/services/recommendation.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Controller('recommendations')
export class RecommendationController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly recommendationService: RecommendationService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  @Get('queue-status')
  async getQueueStatus() {
    const [waiting, active, completed, failed, delayed] = await Promise.all([
      this.recommendationQueue.getWaitingCount(),
      this.recommendationQueue.getActiveCount(),
      this.recommendationQueue.getCompletedCount(),
      this.recommendationQueue.getFailedCount(),
      this.recommendationQueue.getDelayedCount(),
    ]);

    const workers = await this.recommendationQueue.getWorkers();

    return {
      waiting,
      active,
      completed,
      failed,
      delayed,
      workerCount: workers.length,
      isPaused: await this.recommendationQueue.isPaused(),
    };
  }

  @Post('sync')
  async syncRecommendations() {
    // Синк публикаций
    // Используем $queryRaw, так как Prisma не поддерживает фильтрацию по Unsupported("vector")
    const publications = await this.prisma.$queryRaw<any[]>`
      SELECT p.id, p.title, p."textContent"
      FROM "Publication" p
      JOIN "PublicationStatus" ps ON p."statusId" = ps.id
      WHERE ps.type = 'published' AND p.embedding IS NULL
    `;

    for (const pub of publications) {
      await this.recommendationService.generateAndSaveEmbedding(
        pub.id,
        'publication',
        `${pub.title} ${pub.textContent || ''}`,
      );
    }

    // Синк туториалов
    const tutorials = await this.prisma.$queryRaw<any[]>`
      SELECT t.id, t.title, t.description
      FROM "Tutorial" t
      JOIN "TutorialStatus" ts ON t."statusId" = ts.id
      WHERE ts.type = 'published' AND t.embedding IS NULL
    `;

    for (const tut of tutorials) {
      await this.recommendationService.generateAndSaveEmbedding(
        tut.id,
        'tutorial',
        `${tut.title} ${tut.description || ''}`,
      );
    }

    // Синк топиков
    const topics = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, description FROM "Topic" WHERE embedding IS NULL
    `;

    for (const topic of topics) {
      await this.recommendationService.generateAndSaveEmbedding(
        topic.id,
        'topic',
        `${topic.name} ${topic.description || ''}`,
      );
    }

    // Синк каналов
    const channels = await this.prisma.$queryRaw<any[]>`
      SELECT id, name, description FROM "Channel" WHERE embedding IS NULL
    `;

    for (const channel of channels) {
      await this.recommendationService.generateAndSaveEmbedding(
        channel.id,
        'channel',
        `${channel.name} ${channel.description || ''}`,
      );
    }

    // Синк тредов
    const threads = await this.prisma.$queryRaw<any[]>`
      SELECT id, content FROM "Thread" WHERE embedding IS NULL
    `;

    for (const thread of threads) {
      await this.recommendationService.generateAndSaveEmbedding(
        thread.id,
        'thread',
        thread.content || '',
      );
    }

    return {
      status: 'success',
      processed: {
        publications: publications.length,
        tutorials: tutorials.length,
        topics: topics.length,
        channels: channels.length,
        threads: threads.length,
      },
    };
  }

  @Post('debug-user/:userId')
  async debugUser(@Param('userId') userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true },
    });

    if (!user) {
      return { error: 'User not found' };
    }

    const vectors = (await this.prisma.$queryRawUnsafe(
      `SELECT "interestVector"::text FROM "User" WHERE id = $1`,
      userId,
    )) as any[];

    const stats = {
      user,
      interestVectorPresent: !!vectors[0]?.interestVector,
      interestVectorValue: vectors[0]?.interestVector,
      queue: await this.getQueueStatus(),
      contentStats: {
        publicationsWithEmbedding: Number(
          (
            await this.prisma.$queryRaw<any[]>`SELECT COUNT(*) FROM "Publication" WHERE embedding IS NOT NULL`
          )[0].count,
        ),
        tutorialsWithEmbedding: Number(
          (
            await this.prisma.$queryRaw<any[]>`SELECT COUNT(*) FROM "Tutorial" WHERE embedding IS NOT NULL`
          )[0].count,
        ),
        topicsWithEmbedding: Number(
          (
            await this.prisma.$queryRaw<any[]>`SELECT COUNT(*) FROM "Topic" WHERE embedding IS NOT NULL`
          )[0].count,
        ),
        channelsWithEmbedding: Number(
          (
            await this.prisma.$queryRaw<any[]>`SELECT COUNT(*) FROM "Channel" WHERE embedding IS NOT NULL`
          )[0].count,
        ),
        threadsWithEmbedding: Number(
          (
            await this.prisma.$queryRaw<any[]>`SELECT COUNT(*) FROM "Thread" WHERE embedding IS NOT NULL`
          )[0].count,
        ),
      },
    };

    return stats;
  }
}
