import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { EmbeddingService } from './embedding.service';

@Injectable()
export class RecommendationService {
  private readonly logger = new Logger(RecommendationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  /**
   * Обновляет вектор интересов пользователя на основе просмотренного контента.
   * Использует экспоненциальное затухание: новое состояние = старое * 0.9 + новое * 0.1
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
      // 1. Получаем вектор контента
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
          // pgvector возвращает "[0.1,0.2,...]"
          contentEmbedding = item.embedding
            .replace(/[\[\]]/g, '')
            .split(',')
            .map(Number);
        } else if (item) {
          // Если эмбеддинга нет, генерируем его на лету
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
            await this.generateAndSaveEmbedding(targetId, targetType as any, text);
            // Повторно запрашиваем обновленный эмбеддинг
            const updatedItems = (await this.prisma.$queryRawUnsafe(
              `SELECT embedding::text FROM "${tableName}" WHERE id = $1`,
              targetId,
            )) as any[];
            if (updatedItems[0]?.embedding) {
              contentEmbedding = updatedItems[0].embedding
                .replace(/[\[\]]/g, '')
                .split(',')
                .map(Number);
            }
          }
        }
      }

      if (!contentEmbedding) {
        this.logger.warn(
          `No embedding found for ${targetType} ${targetId}. Make sure generateAndSaveEmbedding was called for this content.`,
        );
        return;
      }

      // 2. Обновляем вектор пользователя
      // Вместо выполнения арифметики на стороне БД, что вызывает ошибки типизации в pgvector/Prisma,
      // выполняем ее в памяти. Это надежнее.
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
   * Получает персонализированную ленту для пользователя на основе его вектора интересов.
   */
  async getRecommendedFeed(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<any[]> {
    try {
      // Используем оператор <=> (косинусное расстояние) для ранжирования
      // Мы джойним FeedItem с Publication/Tutorial и сортируем по близости к interestVector пользователя
      // Финальная сортировка по publishedAt (COALESCE Publication/Tutorial publishedAt, fallback на FeedItem createdAt)
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
   * Получает рекомендованные топики для пользователя.
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
   * Получает рекомендованные треды для пользователя.
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
   * Получает рекомендованных пользователей (экспертов) на основе интересов.
   */
  async getRecommendedUsers(
    userId: string,
    limit: number = 10,
    offset: number = 0,
  ) {
    try {
      // Ищем пользователей, чей вектор интересов похож на вектор текущего пользователя,
      // исключая самого пользователя.
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
   * Генерирует и сохраняет эмбеддинг для контента.
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
