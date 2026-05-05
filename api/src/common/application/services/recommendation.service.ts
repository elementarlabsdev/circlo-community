import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmbeddingService } from './embedding.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
    @InjectQueue('recommendation-queue') private recommendationQueue: Queue,
  ) {}

  /**
   * Updates the user's interest vector based on the content viewed.
   * Uses exponential decay: new state = old * 0.9 + new * 0.1
   */
  async updateUserInterests(
    userId: string,
    targetId: string,
    targetType:
      | 'publication'
      | 'tutorial'
      | 'channel'
      | 'topic'
      | 'thread'
      | 'user',
  ) {
    try {
      if (!userId || !targetId) {
        this.logger.error(
          `Invalid input: userId=${userId}, targetId=${targetId}`,
        );
        return;
      }
      // 1. Get content vector
      let contentEmbedding: number[] | null = null;
      this.logger.debug(
        `Updating interests for user ${userId} based on ${targetType} ${targetId}`,
      );

      if (targetType === 'user') {
        const users = (await this.prisma.$queryRawUnsafe(
          `SELECT "interestVector"::text FROM "User" WHERE id = $1`,
          targetId,
        )) as any[];
        const user = users[0];
        if (user?.interestVector) {
          contentEmbedding = (user.interestVector as any)
            .replace(/[\[\]]/g, '')
            .split(',')
            .map(Number);
        }
      } else {
        const tableMap: Record<string, string> = {
          publication: 'Publication',
          tutorial: 'Tutorial',
          channel: 'Channel',
          topic: 'Topic',
          thread: 'Thread',
        };

        const tableName = tableMap[targetType];
        if (!tableName) {
          this.logger.error(`Unsupported target type: ${targetType}`);
          return;
        }

        const items = (await this.prisma.$queryRawUnsafe(
          `SELECT id, embedding::text FROM "${tableName}" WHERE id = $1`,
          targetId,
        )) as any[];
        const item = items[0];

        if (item?.embedding) {
          // pgvector returns "[0.1,0.2,...]"
          contentEmbedding = item.embedding
            .replace(/[\[\]]/g, '')
            .split(',')
            .map(Number);
        } else if (item) {
          // If embedding is missing, generate it on the fly
          this.logger.debug(
            `Embedding not found for ${targetType} ${targetId}. Generating on-the-fly...`,
          );
          let text = '';
          if (targetType === 'publication') {
            const pub = await this.prisma.publication.findUnique({
              where: { id: targetId },
              select: { title: true, textContent: true },
            });
            if (pub) text = `${pub.title} ${pub.textContent || ''}`;
          } else if (targetType === 'tutorial') {
            const tut = await this.prisma.tutorial.findUnique({
              where: { id: targetId },
              select: { title: true, description: true },
            });
            if (tut) text = `${tut.title} ${tut.description || ''}`;
          } else if (targetType === 'topic') {
            const topic = await this.prisma.topic.findUnique({
              where: { id: targetId },
              select: { name: true, description: true },
            });
            if (topic) text = `${topic.name || ''} ${topic.description || ''}`;
          } else if (targetType === 'channel') {
            const channel = await this.prisma.channel.findUnique({
              where: { id: targetId },
              select: { name: true, description: true },
            });
            if (channel) text = `${channel.name || ''} ${channel.description || ''}`;
          } else if (targetType === 'thread') {
            const thread = await this.prisma.thread.findUnique({
              where: { id: targetId },
              select: { textContent: true },
            });
            if (thread) text = thread.textContent || '';
          }

          if (text.trim()) {
            await this.recommendationQueue.add('generate-embedding', {
              targetId,
              targetType,
              text,
              userId, // Pass userId so that interests can be updated after generation
            });
            this.logger.debug(
              `Queued embedding generation for ${targetType} ${targetId} (user: ${userId})`,
            );
          }
        }
      }

      if (!contentEmbedding) {
        if (targetType !== 'user') {
          this.logger.debug(
            `Embedding for ${targetType} ${targetId} is being generated. Interest update will be retried automatically.`,
          );
        } else {
          this.logger.warn(
            `No embedding found for ${targetType} ${targetId}. Make sure generateAndSaveEmbedding was called for this content.`,
          );
        }
        return;
      }

      // 2. Update user vector
      // Instead of performing arithmetic on the database side, which causes typing errors in pgvector/Prisma,
      // we perform it in memory. This is more reliable.
      const users = (await this.prisma.$queryRawUnsafe(
        `SELECT "interestVector"::text FROM "User" WHERE id = $1`,
        userId,
      )) as any[];
      const user = users[0];

      let newVector: number[] = contentEmbedding;

      if (user?.interestVector) {
        const currentVector: number[] = user.interestVector
          .replace(/[\[\]]/g, '')
          .split(',')
          .map(Number);

        if (currentVector.length === contentEmbedding.length) {
          newVector = currentVector.map((val, i) => {
            return val * 0.9 + contentEmbedding[i] * 0.1;
          });
        }
      }

      const newVectorStr = `[${newVector.join(',')}]`;
      const result = await this.prisma.$executeRawUnsafe(
        `UPDATE "User" SET "interestVector" = CAST($1 AS vector) WHERE id = $2`,
        newVectorStr,
        userId,
      );

      this.logger.debug(
        `User ${userId} interestVector updated in memory and saved. Rows affected: ${result}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to update user interests: ${error.message}`,
        error.stack,
      );
    }
  }

  /**
   * Gets a personalized feed for the user based on their interest vector.
   */
  async getRecommendedFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      // Use the <=> operator (cosine distance) for ranking
      // We join FeedItem with Publication/Tutorial and sort by proximity to the user's interestVector
      // Final sorting by publishedAt (COALESCE Publication/Tutorial publishedAt, fallback to FeedItem createdAt)
      return (await this.prisma.$queryRawUnsafe(
        `
        SELECT
          fi.*,
          (1 - (COALESCE(p.embedding, t.embedding) <=> u."interestVector")) as similarity_score,
          COALESCE(p."publishedAt", t."publishedAt", fi."createdAt") as "effectivePublishedAt"
        FROM "FeedItem" fi
        LEFT JOIN "Publication" p ON fi."targetId" = p.id AND fi."targetType" = 'publication'
        LEFT JOIN "Tutorial" t ON fi."targetId" = t.id AND fi."targetType" = 'tutorial'
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND (p.embedding IS NOT NULL OR t.embedding IS NOT NULL)
          AND fi.hidden = false
        ORDER BY "effectivePublishedAt" DESC, similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      )) as any[];
    } catch (error) {
      this.logger.error(
        `Failed to get recommended feed: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Gets recommended topics for the user.
   */
  async getRecommendedTopics(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      return (await this.prisma.$queryRawUnsafe(
        `
        SELECT
          t.*,
          (1 - (t.embedding <=> u."interestVector")) as similarity_score
        FROM "Topic" t
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND t.embedding IS NOT NULL
        ORDER BY similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      )) as any[];
    } catch (error) {
      this.logger.error(
        `Failed to get recommended topics: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Получает рекомендованные каналы для пользователя.
   */
  async getRecommendedChannels(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      return (await this.prisma.$queryRawUnsafe(
        `
        SELECT
          c.*,
          (1 - (c.embedding <=> u."interestVector")) as similarity_score
        FROM "Channel" c
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND c.embedding IS NOT NULL
        ORDER BY similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      )) as any[];
    } catch (error) {
      this.logger.error(
        `Failed to get recommended channels: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Получает рекомендованные публикации для пользователя.
   */
  async getRecommendedPublications(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    try {
      return await this.prisma.$queryRawUnsafe(
        `
        SELECT
          p.*,
          (1 - (p.embedding <=> u."interestVector")) as similarity_score
        FROM "Publication" p
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND p.embedding IS NOT NULL
        ORDER BY "publishedAt" DESC, similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get recommended publications: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Получает рекомендованные туториалы для пользователя.
   */
  async getRecommendedTutorials(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    try {
      return await this.prisma.$queryRawUnsafe(
        `
        SELECT
          t.*,
          (1 - (t.embedding <=> u."interestVector")) as similarity_score
        FROM "Tutorial" t
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND t.embedding IS NOT NULL
        ORDER BY "publishedAt" DESC, similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get recommended tutorials: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Gets recommended threads for the user.
   */
  async getRecommendedThreads(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ) {
    try {
      return await this.prisma.$queryRawUnsafe(
        `
        SELECT
          t.*,
          (1 - (t.embedding <=> u."interestVector")) as similarity_score
        FROM "Thread" t
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND t.embedding IS NOT NULL
        ORDER BY "createdAt" DESC, similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get recommended threads: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Gets recommended users (experts) based on interests.
   */
  async getRecommendedUsers(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    try {
      // Look for users whose interest vector is similar to the current user's vector,
      // excluding the user themselves.
      return await this.prisma.$queryRawUnsafe(
        `
        SELECT
          target_u.*,
          (1 - (target_u."interestVector" <=> u."interestVector")) as similarity_score
        FROM "User" target_u
        JOIN "User" u ON u.id = $1
        WHERE u."interestVector" IS NOT NULL
          AND target_u."interestVector" IS NOT NULL
          AND target_u.id != $1
        ORDER BY similarity_score DESC
        LIMIT $2 OFFSET $3
      `,
        userId,
        limit,
        offset,
      );
    } catch (error) {
      this.logger.error(
        `Failed to get recommended users: ${error.message}`,
        error.stack,
      );
      return [];
    }
  }

  /**
   * Generates and saves the embedding for the content.
   */
  async generateAndSaveEmbedding(
    targetId: string,
    targetType: 'publication' | 'tutorial' | 'channel' | 'topic' | 'thread',
    text: string,
  ) {
    const embedding = await this.embeddingService.generateEmbedding(text);
    const vectorStr = `[${embedding.join(',')}]`;

    const tableMap: Record<string, string> = {
      publication: 'Publication',
      tutorial: 'Tutorial',
      channel: 'Channel',
      topic: 'Topic',
      thread: 'Thread',
    };

    const tableName = tableMap[targetType];
    if (!tableName) {
      this.logger.error(`Unsupported target type for embedding: ${targetType}`);
      return;
    }

    await this.prisma.$executeRawUnsafe(
      `UPDATE "${tableName}" SET embedding = CAST($1 AS vector) WHERE id = $2`,
      vectorStr,
      targetId,
    );
  }
}
