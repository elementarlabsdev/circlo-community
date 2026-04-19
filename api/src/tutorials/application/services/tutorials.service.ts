import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { I18nService } from 'nestjs-i18n';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Prisma, User, Tutorial, Lesson, QuestionType } from '@prisma/client';
import { UpdateTutorialDto } from '@/tutorials/application/dto/update-tutorial.dto';
import { PublishTutorialDto } from '@/tutorials/application/dto/publish-tutorial.dto';
import * as crypto from 'crypto';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FeedService } from '@/feed/application/services/feed.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import { InstructorTutorialsQueryDto } from '@/tutorials/application/dto/instructor-tutorials-query.dto';
import { TutorialSettingsDto } from '@/tutorials/application/dto/tutorial-settings.dto';
import { TutorialFeaturedImageDto } from '@/tutorials/application/dto/tutorial-featured-image.dto';
import { ChangeSectionNameDto } from '@/tutorials/application/dto/change-section-name.dto';
import { PaginationQueryDto } from '@/common/application/dtos/pagination-query.dto';
import { randomSuffix, slugify } from '@/common/application/utils/slug.util';
import { readingTime } from 'reading-time-estimator';
import { ActivityService } from '@/platform/application/services/activity.service';
import { RecommendationService } from '@/common/application/services/recommendation.service';
import { QuizNameDto } from '@/tutorials/application/dto/quiz-name.dto';
import {
  SaveQuizContentDto,
  SaveQuizQuestionType,
} from '@/tutorials/application/dto/save-quiz-content.dto';

@Injectable()
export class TutorialsService {
  constructor(
    private prisma: PrismaService,
    private readonly feed: FeedService,
    private readonly activityService: ActivityService,
    private readonly settingsService: SettingsService,
    private readonly recommendationService: RecommendationService,
    @InjectQueue('tutorial-queue') private tutorialQueue: Queue,
    private readonly i18n: I18nService,
  ) {}

  /**
   * Recompute tutorialsCount for related entities based on currently published tutorials.
   */
  private async recomputeUserTutorialsCount(
    tx: Prisma.TransactionClient,
    userId: string,
  ) {
    const total = await tx.tutorial.count({
      where: { authorId: userId, status: { type: 'published' } },
    });
    await tx.user.update({
      where: { id: userId },
      data: { tutorialsCount: total },
    });
  }

  private async recomputeChannelTutorialsCount(
    tx: Prisma.TransactionClient,
    channelId: string,
  ) {
    const total = await tx.tutorial.count({
      where: { channelId, status: { type: 'published' } },
    });
    await tx.channel.update({
      where: { id: channelId },
      data: { tutorialsCount: total },
    });
  }

  /**
   * Recompute cached quizzes count for a tutorial based on section items of type 'quiz'.
   */
  private async recomputeTutorialQuizzesCount(
    tx: Prisma.TransactionClient,
    tutorialId: string,
  ) {
    const total = await tx.sectionItem.count({
      where: { section: { tutorialId }, type: 'quiz' },
    });
    await tx.tutorial.update({
      where: { id: tutorialId },
      data: { quizesCount: total },
    });
  }

  private async recomputeTopicsTutorialsCount(
    tx: Prisma.TransactionClient,
    topicIds: string[],
  ) {
    if (!topicIds || topicIds.length === 0) return;
    // Recompute per topic to ensure exact values
    for (const id of topicIds) {
      const total = await tx.tutorial.count({
        where: { status: { type: 'published' }, topics: { some: { id } } },
      });
      await tx.topic.update({ where: { id }, data: { tutorialsCount: total } });
    }
  }

  /**
   * Проверяет, существует ли опубликованный туториал с указанным id
   */
  async getTutorialById(id: string) {
    return this.prisma.tutorial.findUnique({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    if (!id) return false;
    const count = await this.prisma.tutorial.count({
      where: {
        id,
        status: { type: 'published' },
      },
    });
    return count > 0;
  }

  /**
   * Пересчитывает aggregated estimatedTime для Tutorial по всем его урокам.
   * Использует значения readingTime у Lesson и агрегирует minutes/words, формируя text.
   */
  private async recomputeTutorialReadingTime(tutorialId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        sectionItem: { section: { tutorialId } },
      },
      select: { readingTime: true },
    });
    let totalMinutes = 0;
    let totalWords = 0;
    for (const l of lessons) {
      const rt: any = l.readingTime as any;
      if (!rt) continue;
      if (typeof rt.minutes === 'number') totalMinutes += rt.minutes;
      if (typeof rt.words === 'number') totalWords += rt.words;
    }
    const roundedMinutes = Math.max(0, Math.ceil(totalMinutes));
    const text =
      roundedMinutes > 0 ? `${roundedMinutes} min read` : 'less than a minute';
    // Use updateMany to avoid throwing if the target tutorial record is missing
    await this.prisma.tutorial.updateMany({
      where: { id: tutorialId },
      data: {
        estimatedTime: {
          minutes: totalMinutes,
          words: totalWords,
          text,
        } as any,
      },
    });
  }

  async createTutorialDraft(user: User) {
    const maxDraftTutorialsPerUser = await this.settingsService.findValueByName(
      'maxDraftTutorialsPerUser',
      10,
    );
    const draftCount = await this.prisma.tutorial.count({
      where: {
        authorId: user.id,
        status: { type: 'draft' },
      },
    });

    if (draftCount >= maxDraftTutorialsPerUser) {
      throw new BadRequestException(
        await this.i18n.t('common.errors.max_drafts_reached'),
      );
    }

    const rnd = crypto.randomBytes(4).toString('hex');
    const defaultTitle = `Untitled Tutorial - ${rnd}`;
    // Since Tutorial.licenseType is required in schema, ensure default license exists
    const licenseType = await this.prisma.licenseType.findFirstOrThrow({
      where: { isDefault: true },
    });

    // Create draft, ensure root linkage and NON-EMPTY slug within a single transaction
    const created = await this.prisma.$transaction(async (tx) => {
      const draft = await tx.tutorial.create({
        data: {
          title: defaultTitle,
          description: null,
          author: { connect: { id: user.id } },
          status: { connect: { type: 'draft' } },
          licenseType: { connect: { id: licenseType.id } },
        },
      });

      // Root must point to self for the very first version
      if (!draft.rootId) {
        await tx.tutorial.update({
          where: { id: draft.id },
          data: { root: { connect: { id: draft.id } } },
        });
      }

      // Enforce non-empty unique slug for drafts
      const slug = await this.generateUniqueSlug(tx, defaultTitle);
      const withSlug = await tx.tutorial.update({
        where: { id: draft.id },
        data: { slug },
      });
      return withSlug;
    });

    // Create activity for first creation of tutorial draft
    await this.activityService.createActivity({
      actor: user as any,
      action: 'TUTORIAL_CREATED',
      targetType: 'TUTORIAL',
      targetId: created.id,
      details: { title: (created as any).title, id: created.id } as any,
    });

    return created;
  }

  async updateTutorial(tutorialId: string, dto: UpdateTutorialDto, user: User) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);
    if ('statusId' in dto || 'status' in dto) {
      throw new BadRequestException(
        'Tutorial status cannot be updated directly. Use the /publish endpoint.',
      );
    }
    if (
      tutorial.status.type === 'published' ||
      tutorial.status.type === 'inReview'
    ) {
      throw new ForbiddenException(
        'Cannot edit a tutorial that is published or in review.',
      );
    }
    const { channelId, ...rest } = dto as any;
    const data: Prisma.TutorialUpdateInput = {
      ...rest,
      hasChanges: true,
      updatedAt: new Date(),
    } as any;
    if (typeof channelId !== 'undefined') {
      (data as any).channel =
        channelId == null || channelId === ''
          ? { disconnect: true }
          : { connect: { id: channelId } };
    }
    return this.prisma.tutorial.update({
      where: { id: tutorialId },
      data,
    });
  }

  async publishTutorial(
    tutorialId: string,
    user: User,
    dto?: PublishTutorialDto,
  ) {
    // Сначала проверим права на переданный tutorialId
    let tutorial = await this.checkTutorialOwnership(tutorialId, user.id);

    // Если пришёл id опубликованной версии, но у корня есть драфт с неопубликованными изменениями —
    // публикуем именно этот драфт. Это делает endpoint устойчивым к тому,
    // какой id передаёт клиент (published или draft).
    if (tutorial.status.type === 'published') {
      const rootId = tutorial.rootId ?? tutorial.id;
      const draftWithChanges = await this.prisma.tutorial.findFirst({
        where: { rootId, status: { type: 'unpublishedChanges' } },
        include: { status: true },
      });
      if (!draftWithChanges) {
        throw new BadRequestException('This tutorial is already published.');
      }
      // Переключаем контекст публикации на драфт с изменениями
      tutorial = draftWithChanges as any;
      tutorialId = draftWithChanges.id;
    }

    // Разрешаем публикацию/расписание из 'draft', 'unpublishedChanges' и 'scheduled'
    if (
      !['draft', 'unpublishedChanges', 'scheduled'].includes(
        tutorial.status.type,
      )
    ) {
      throw new BadRequestException(
        'Only draft, unpublished changes or scheduled tutorials can be published or scheduled.',
      );
    }

    // Scheduling case
    const scheduledAtRaw = dto?.scheduledAt ?? null;
    if (scheduledAtRaw) {
      const scheduledAt = new Date(scheduledAtRaw);
      const now = new Date();
      if (isNaN(scheduledAt.getTime())) {
        throw new BadRequestException('scheduledAt must be a valid ISO date');
      }

      const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
      if (scheduledAt < oneMinuteAgo) {
        throw new BadRequestException(
          'Scheduled date is too far in the past. Please choose a future date.',
        );
      }

      if (scheduledAt > now || scheduledAt >= oneMinuteAgo) {
        const delay = Math.max(0, scheduledAt.getTime() - now.getTime());
        await this.prisma.tutorial.update({
          where: { id: tutorialId },
          data: {
            scheduledAt,
            status: { connect: { type: 'scheduled' } },
            hasChanges: false,
          },
          include: {
            status: true,
          },
        });
        await this.tutorialQueue.add(
          'publish',
          { id: tutorialId },
          { delay, jobId: `publish-${tutorialId}`, removeOnComplete: true },
        );
        return this.prisma.tutorial.findUnique({
          where: { id: tutorialId },
          include: { status: true },
        });
      }
    }

    const fullTutorial = await this.prisma.tutorial.findUnique({
      where: { id: tutorialId },
      include: {
        sections: {
          include: { items: { include: { lesson: true, quiz: true } } },
        },
        channel: true,
      },
    });
    const validationErrors = this.validateTutorialForPublishing(fullTutorial);
    if (validationErrors.length > 0) {
      throw new BadRequestException(
        `Cannot publish tutorial. Errors: ${validationErrors.join('; ')}`,
      );
    }

    // Promote draft to published within the same root, demote previous published to archived
    let isFirstPublish = false;
    const updated = await this.prisma.$transaction(async (tx) => {
      // Resolve root
      const currentDraft = await tx.tutorial.findUnique({
        where: { id: tutorialId },
        include: { status: true },
      });
      if (!currentDraft)
        throw new NotFoundException(
          await this.i18n.t('common.errors.draft_not_found'),
        );
      let rootId = currentDraft.rootId ?? currentDraft.id;

      // If this is the very first publish and draft has null root, set rootId to self for consistency
      if (!currentDraft.rootId) {
        await tx.tutorial.update({
          where: { id: currentDraft.id },
          data: { root: { connect: { id: currentDraft.id } } },
        });
        rootId = currentDraft.id;
      }

      // Promoting content from drafts to live fields happens here.
      // We iterate over the draft tree and apply the latest draft content to the actual records.
      const draftTreeForContentSync = await tx.section.findMany({
        where: { tutorialId: currentDraft.id },
        include: {
          items: {
            include: {
              lesson: {
                include: {
                  drafts: { orderBy: { version: 'desc' }, take: 1 },
                },
              },
              quiz: {
                include: {
                  drafts: { orderBy: { version: 'desc' }, take: 1 },
                },
              },
            },
          },
        },
      });

      for (const section of draftTreeForContentSync) {
        for (const item of section.items) {
          if (item.lesson && item.lesson.drafts?.[0]) {
            const draft = item.lesson.drafts[0].draft as any;
            await tx.lesson.update({
              where: { id: item.lesson.id },
              data: {
                name: draft.name ?? item.lesson.name,
                textContent: draft.textContent ?? item.lesson.textContent,
                blocksContent: draft.blocksContent ?? item.lesson.blocksContent,
                slug: draft.slug ?? item.lesson.slug,
                readingTime: draft.readingTime ?? item.lesson.readingTime,
                learningDuration:
                  draft.learningDuration ?? item.lesson.learningDuration,
                featuredImageUrl:
                  draft.featuredImageUrl ?? item.lesson.featuredImageUrl,
                featuredImageId:
                  draft.featuredImageId ?? item.lesson.featuredImageId,
                lastPublishedDraftVersion: item.lesson.drafts[0].version,
                hasChanges: false,
              },
            });
          }
          if (item.quiz && item.quiz.drafts?.[0]) {
            const draft = item.quiz.drafts[0].draft as any;
            // Sync Quiz basic fields
            await tx.quiz.update({
              where: { id: item.quiz.id },
              data: {
                name: draft.name ?? item.quiz.name,
                description: draft.description ?? item.quiz.description,
                slug: draft.slug ?? item.quiz.slug,
                passingScore: draft.passingScore ?? item.quiz.passingScore,
                lastPublishedDraftVersion: item.quiz.drafts[0].version,
                hasChanges: false,
              },
            });

            // Sync Questions/Options if they exist in draft
            if (Array.isArray(draft.questions)) {
              // Delete existing
              await tx.answerOption.deleteMany({
                where: { question: { quizId: item.quiz.id } },
              });
              await tx.question.deleteMany({
                where: { quizId: item.quiz.id },
              });

              // Create from draft
              for (const q of draft.questions) {
                const createdQ = await tx.question.create({
                  data: {
                    quizId: item.quiz.id,
                    text: q.text,
                    position: q.position,
                    type: q.type as QuestionType,
                    imageUrl: q.imageUrl,
                    imageId: q.imageId,
                  },
                });
                if (Array.isArray(q.options)) {
                  for (const o of q.options) {
                    await tx.answerOption.create({
                      data: {
                        questionId: createdQ.id,
                        text: o.text,
                        isCorrect: o.isCorrect,
                        position: o.position,
                      },
                    });
                  }
                }
              }
            }
          }
        }
      }

      // Find current published of the same root
      const currentPublished = await tx.tutorial.findFirst({
        where: {
          status: { type: 'published' },
          OR: [
            { rootId: rootId }, // normal case: published has rootId set to root
            { id: rootId }, // legacy case: the root published row has rootId = null and is itself the root
          ],
        },
      });

      // Mark if this is the first publication for this tutorial root
      isFirstPublish = !currentPublished;

      // Decide which slug will be used for the new published version
      // Preference order:
      // 1) If draft has an explicit slug (validated as unique earlier) — use it
      // 2) Else, keep slug from previously published version (if any)
      // 3) Else, generate a new unique slug from the draft title
      let slugToUse: string | null = null;
      if (currentDraft.slug) {
        slugToUse = currentDraft.slug;
      } else if (currentPublished?.slug) {
        slugToUse = currentPublished.slug;
      } else {
        // No previous slug: generate a new one from the draft title (unique)
        const draftTitle = (currentDraft as any).title ?? 'tutorial';
        slugToUse = await this.generateUniqueSlug(tx, draftTitle);
      }

      // Before switching statuses, если есть предыдущая опубликованная версия,
      // бэкофилим slug-и уроков/викторин в текущем драфте (если они пустые),
      // сопоставляя по stableKey, а при отсутствии — по позиции (legacy).
      if (currentPublished) {
        // Загружаем минимальные деревья для сопоставления
        const [draftTree, publishedTree] = await Promise.all([
          tx.section.findMany({
            where: { tutorialId: currentDraft.id },
            select: {
              id: true,
              position: true,
              stableKey: true,
              items: {
                select: {
                  id: true,
                  position: true,
                  stableKey: true,
                  lesson: { select: { id: true, slug: true } },
                  quiz: { select: { id: true, slug: true } },
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          }),
          tx.section.findMany({
            where: { tutorialId: currentPublished.id },
            select: {
              id: true,
              position: true,
              stableKey: true,
              items: {
                select: {
                  position: true,
                  stableKey: true,
                  lesson: { select: { slug: true } },
                  quiz: { select: { slug: true } },
                },
                orderBy: { position: 'asc' },
              },
            },
            orderBy: { position: 'asc' },
          }),
        ]);

        // Готовим быстрые словари для поиска соответствий
        const pubSectionsByKey = new Map(
          publishedTree
            .filter((s) => s.stableKey)
            .map((s) => [s.stableKey as string, s]),
        );
        const pubSectionsByPos = new Map(
          publishedTree.map((s) => [s.position, s]),
        );

        for (const dSec of draftTree as any[]) {
          const pSec =
            (dSec.stableKey
              ? pubSectionsByKey.get(dSec.stableKey)
              : undefined) || pubSectionsByPos.get(dSec.position);
          if (!pSec) continue;

          const pubItemsByKey = new Map<string, any>(
            (pSec.items || [])
              .filter((i: any) => i.stableKey)
              .map((i: any) => [i.stableKey as string, i]),
          );
          const pubItemsByPos = new Map<number, any>(
            (pSec.items || []).map((i: any) => [i.position, i]),
          );

          for (const dItem of (dSec.items || []) as any[]) {
            const pItem =
              (dItem.stableKey
                ? pubItemsByKey.get(dItem.stableKey)
                : undefined) || pubItemsByPos.get(dItem.position);
            if (!pItem) continue;

            // Если у драфтового урока нет slug, но у опубликованного есть — переносим
            if (dItem.lesson && !dItem.lesson.slug && pItem.lesson?.slug) {
              await tx.lesson.update({
                where: { id: dItem.lesson.id },
                data: { slug: pItem.lesson.slug },
              });
            }
            // Аналогично для викторины
            if (dItem.quiz && !dItem.quiz.slug && pItem.quiz?.slug) {
              await tx.quiz.update({
                where: { id: (dItem.quiz as any).id },
                data: { slug: pItem.quiz.slug },
              });
            }
          }
        }
      }

      // Archive previous published and free its slug
      if (currentPublished) {
        const updateData: Prisma.TutorialUpdateInput = {
          status: { connect: { type: 'archived' } },
          slug: null,
        } as any;
        // Normalize legacy published root rows to have proper root relation
        if (!currentPublished.rootId) {
          (updateData as any).root = { connect: { id: rootId } };
        }
        // Load minimal relations for counters before status update
        const prevPublishedFull = await tx.tutorial.findUnique({
          where: { id: currentPublished.id },
          include: { topics: { select: { id: true } } },
        });

        await tx.tutorial.update({
          where: { id: currentPublished.id },
          data: updateData,
        });

        // Recompute counters for previous published relations
        if (prevPublishedFull) {
          await this.recomputeUserTutorialsCount(
            tx,
            prevPublishedFull.authorId,
          );
          if (prevPublishedFull.channelId) {
            await this.recomputeChannelTutorialsCount(
              tx,
              prevPublishedFull.channelId,
            );
          }
          const topicIds = (prevPublishedFull.topics || []).map((t) => t.id);
          await this.recomputeTopicsTutorialsCount(tx, topicIds);
        }
      }

      // Promote draft to published
      const published = await tx.tutorial.update({
        where: { id: tutorialId },
        data: {
          status: { connect: { type: 'published' } },
          publishedAt: isFirstPublish
            ? new Date()
            : (currentPublished?.publishedAt ?? new Date()),
          scheduledAt: null,
          slug: slugToUse ?? undefined,
          hasChanges: false,
        },
        include: {
          status: true,
          topics: { select: { id: true } },
        },
      });

      // Recompute counters for newly published relations
      await this.recomputeUserTutorialsCount(tx, (published as any).authorId);
      if ((published as any).channelId) {
        await this.recomputeChannelTutorialsCount(
          tx,
          (published as any).channelId,
        );
      }
      const newTopicIds =
        (published as any).topics?.map((t: any) => t.id) || [];
      await this.recomputeTopicsTutorialsCount(tx, newTopicIds);

      return { published, currentPublishedId: currentPublished?.id };
    });

    const { published, currentPublishedId } = updated as any;

    if (currentPublishedId) {
      await this.feed.onRemoved({
        targetType: 'tutorial',
        targetId: currentPublishedId,
      });
    }

    await this.feed.onPublished({
      targetType: 'tutorial',
      targetId: (published as any).id,
      authorId: (published as any).authorId,
      createdAt: (published as any).publishedAt ?? new Date(),
    });
    // Ensure channel/topics/pinned are in sync for all feed items of this tutorial
    await this.feed.onUpdated({
      targetType: 'tutorial',
      targetId: (published as any).id,
    });

    // Create activity only on first publication
    if (isFirstPublish) {
      await this.activityService.createActivity({
        actor: user as any,
        action: 'TUTORIAL_PUBLISHED',
        targetType: 'TUTORIAL',
        targetId: (published as any).id,
        details: {
          title: (published as any).title,
          id: (published as any).id,
        } as any,
      });
    }

    if (published) {
      this.recommendationService
        .generateAndSaveEmbedding(
          (published as any).id,
          'tutorial',
          `${(published as any).title} ${(published as any).description || ''}`,
        )
        .catch((e) =>
          console.error('Failed to generate embedding for tutorial', e),
        );
    }

    return published;
  }

  /**
   * Generate a unique slug using tutorial title. Ensures uniqueness against tutorial.slug unique index.
   */
  private async generateUniqueSlug(
    tx: Prisma.TransactionClient,
    title: string,
  ): Promise<string> {
    const base = slugify(title) || `tutorial-${randomSuffix(6)}`;
    let candidate = base;
    // Try up to 10 suffix attempts to avoid rare collisions
    for (let i = 0; i < 10; i++) {
      const exists = await tx.tutorial.findFirst({
        where: { slug: candidate },
      });
      if (!exists) return candidate;
      candidate = `${base}-${randomSuffix(4)}`;
    }
    // As a very last resort, append timestamp
    return `${base}-${Date.now().toString(36)}`;
  }

  async cancelSchedule(tutorialId: string, user: User) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);
    if (tutorial.status.type !== 'scheduled') {
      throw new BadRequestException(
        'Only scheduled tutorials can have their schedule canceled',
      );
    }
    await this.tutorialQueue.remove(`publish-${tutorialId}`);
    return this.prisma.tutorial.update({
      where: { id: tutorialId },
      data: {
        scheduledAt: null,
        status: { connect: { type: 'draft' } },
      },
      include: {
        status: true,
      },
    });
  }

  async deleteTutorial(tutorialId: string, user: User) {
    await this.checkTutorialOwnership(tutorialId, user.id);

    const deleted = await this.prisma.$transaction(async (tx) => {
      // Prefetch relations and status to understand counters impact
      const full = await tx.tutorial.findUnique({
        where: { id: tutorialId },
        include: { status: true, topics: { select: { id: true } } },
      });

      const res = await tx.tutorial.delete({ where: { id: tutorialId } });

      // If it was published, recompute counters for relations
      if (full?.status?.type === 'published') {
        await this.recomputeUserTutorialsCount(tx, res.authorId);
        if (res.channelId) {
          await this.recomputeChannelTutorialsCount(tx, res.channelId);
        }
        const topicIds = (full.topics || []).map((t) => t.id);
        await this.recomputeTopicsTutorialsCount(tx, topicIds);
      }

      return res;
    });

    await this.feed.onRemoved({ targetType: 'tutorial', targetId: tutorialId });

    // Create activity on delete
    await this.activityService.createActivity({
      actor: user as any,
      action: 'TUTORIAL_DELETED',
      targetType: 'TUTORIAL',
      targetId: tutorialId,
      details: { title: (deleted as any).title, id: tutorialId } as any,
    });
    return deleted;
  }

  async unpublishTutorial(tutorialId: string, user: User) {
    await this.checkTutorialOwnership(tutorialId, user.id);

    const unpublished = await this.prisma.$transaction(async (tx) => {
      const tutorial = await tx.tutorial.findUnique({
        where: { id: tutorialId },
        include: { status: true, topics: { select: { id: true } } },
      });

      if (!tutorial || tutorial.status.type !== 'published') {
        throw new BadRequestException(
          'Only published tutorials can be unpublished',
        );
      }

      const res = await tx.tutorial.update({
        where: { id: tutorialId },
        data: {
          status: { connect: { type: 'draft' } },
          publishedAt: null,
          scheduledAt: null,
        },
      });

      // Recompute counters
      await this.recomputeUserTutorialsCount(tx, res.authorId);
      if (res.channelId) {
        await this.recomputeChannelTutorialsCount(tx, res.channelId);
      }
      const topicIds = (tutorial.topics || []).map((t) => t.id);
      await this.recomputeTopicsTutorialsCount(tx, topicIds);

      return res;
    });

    await this.feed.onUnpublished({
      targetType: 'tutorial',
      targetId: tutorialId,
    });

    await this.activityService.createActivity({
      actor: user as any,
      action: 'TUTORIAL_UNPUBLISHED',
      targetType: 'TUTORIAL',
      targetId: tutorialId,
      details: { title: (unpublished as any).title, id: tutorialId } as any,
    });

    return unpublished;
  }

  async getPublishedTutorials(query: PaginationQueryDto) {
    const { page, limit } = query;
    const skip = (page - 1) * limit;
    const whereClause: Prisma.TutorialWhereInput = {
      status: { type: 'published' },
    };
    const [total, tutorials] = await this.prisma.$transaction([
      this.prisma.tutorial.count({ where: whereClause }),
      this.prisma.tutorial.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          author: { select: { name: true } },
          status: true,
          channel: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      tutorials,
      pagination: {
        totalItems: total,
        itemCount: tutorials.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async getPublishedBySlug(slug: string) {
    if (!slug || slug.trim() === '') return null;
    const t = await this.prisma.tutorial.findFirst({
      where: { slug, status: { type: 'published' } },
      include: {
        sections: {
          orderBy: { position: 'asc' },
          include: {
            items: {
              include: {
                lesson: { select: { name: true, slug: true } },
                quiz: { select: { name: true, slug: true } },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
        author: true,
        status: true,
        channel: true,
        topics: true,
      },
    });
    if (!t) return null;
    return t as any;
  }

  async findOneByIdWithRelations(id: string) {
    return this.prisma.tutorial.findFirstOrThrow({
      where: { id, status: { type: 'published' } },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
    });
  }

  /**
   * Возвращает опубликованный туториал по id с нужными связями и сразу добавляет внутрь `firstItem`.
   * `firstItem` вычисляется аналогично методу `getFirstPublishedItemByTutorialSlug`, но на основе slug найденного туториала.
   */
  async findOneByIdWithRelationsAndFirstItem(id: string) {
    // Выполняем один запрос к БД, включая нужные связи и первый контентный элемент
    const tutorialWithRelations = await this.prisma.tutorial.findFirstOrThrow({
      where: { id, status: { type: 'published' } },
      include: {
        channel: true,
        author: true,
        topics: true,
        sections: {
          where: {
            items: {
              some: {
                OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
              },
            },
          },
          orderBy: { position: 'asc' },
          take: 1,
          include: {
            items: {
              where: {
                OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
              },
              orderBy: { position: 'asc' },
              take: 1,
              select: {
                id: true,
                type: true,
                position: true,
                lesson: {
                  select: { id: true, name: true, slug: true },
                },
                quiz: {
                  select: { id: true, name: true, slug: true },
                },
              },
            },
          },
        },
      },
    });

    const tutorial: any = tutorialWithRelations as any;

    // Собираем firstItem из уже загруженных секций/айтемов
    let firstItem: any = null;
    try {
      const section = tutorialWithRelations.sections?.[0];
      const item = section?.items?.[0];
      if (section && item) {
        if (item.type === 'lesson' && item.lesson) {
          firstItem = {
            // ВНИМАНИЕ: не добавляем сюда ссылку на сам tutorial,
            // т.к. ниже мы вставим firstItem внутрь tutorial и это создаст циклическую ссылку
            section: {
              id: section.id,
              name: section.name,
              position: section.position,
            },
            item: {
              id: item.id,
              type: 'lesson',
              position: item.position,
              lesson: item.lesson,
            },
          } as any;
        } else if (item.type === 'quiz' && item.quiz) {
          firstItem = {
            // Аналогично не вкладываем tutorial внутрь firstItem
            section: {
              id: section.id,
              name: section.name,
              position: section.position,
            },
            item: {
              id: item.id,
              type: 'quiz',
              position: item.position,
              quiz: item.quiz,
            },
          } as any;
        }
      }
    } catch (e) {
      // fail-safe
      firstItem = null;
    }

    // Добавляем в объект tutorial поле firstItem и очищаем служебные данные, если нужно
    tutorial.firstItem = firstItem;
    // Мы включали sections только для вычисления firstItem. Чтобы ответ был легче и безопаснее,
    // удалим их из возвращаемого объекта.
    if (Array.isArray(tutorial.sections)) {
      delete tutorial.sections;
    }
    return tutorial;
  }

  /**
   * Возвращает опубликованный item (sectionItem) по его id вместе с нужными связями,
   * а также вычисляет соседние элементы previousItem и nextItem по позиции в пределах той же секции.
   * Если туториал не опубликован или элемент не найден — возвращает null.
   */
  async getPublishedItemByIdWithNeighbors(itemId: string) {
    if (!itemId) return null;

    // Находим сам элемент, убеждаемся что его туториал опубликован
    const current = await this.prisma.sectionItem.findFirst({
      where: {
        id: itemId,
        section: { tutorial: { status: { type: 'published' } } },
      },
      include: {
        section: {
          include: {
            tutorial: {
              include: {
                channel: true,
                author: true,
                topics: true,
              },
            },
          },
        },
        lesson: {
          select: {
            id: true,
            name: true,
            slug: true,
            textContent: true,
            blocksContent: true,
            learningDuration: true,
            reactionsCount: true,
            commentsCount: true,
            viewsCount: true,
            readingTime: true,
            featuredImageUrl: true,
            featuredImageId: true,
          },
        },
        quiz: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            passingScore: true,
            questions: {
              select: {
                id: true,
                text: true,
                position: true,
                type: true,
                options: {
                  select: { id: true, text: true, position: true },
                  orderBy: { position: 'asc' },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    if (!current) return null;

    const sectionId = current.sectionId;
    const position = current.position;

    // Предыдущий элемент в рамках той же секции (только контентные элементы)
    const prev = await this.prisma.sectionItem.findFirst({
      where: {
        sectionId,
        position: { lt: position },
        OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
      },
      orderBy: { position: 'desc' },
      select: {
        type: true,
        lesson: { select: { slug: true } },
        quiz: { select: { slug: true } },
      },
    });

    // Следующий элемент
    const next = await this.prisma.sectionItem.findFirst({
      where: {
        sectionId,
        position: { gt: position },
        OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
      },
      orderBy: { position: 'asc' },
      select: {
        type: true,
        lesson: { select: { slug: true } },
        quiz: { select: { slug: true } },
      },
    });

    // Формируем ответ, избегая циклических ссылок
    const tutorial = (current.section as any).tutorial as any;
    const section = {
      id: current.section.id,
      name: current.section.name,
      position: current.section.position,
    } as any;

    const item = {
      id: current.id,
      type: current.type as any,
      position: current.position,
      ...(current.type === 'lesson' && current.lesson
        ? { lesson: current.lesson }
        : {}),
      ...(current.type === 'quiz' && current.quiz
        ? { quiz: current.quiz }
        : {}),
    } as any;

    const mapNeighbor = (n: any): any =>
      !n
        ? null
        : {
            type: n.type,
            slug:
              n.type === 'lesson'
                ? (n.lesson?.slug ?? null)
                : (n.quiz?.slug ?? null),
          };

    // Если нет предыдущего/следующего в той же секции — ищем в соседних секциях
    let previousItem = mapNeighbor(prev);
    let nextItem = mapNeighbor(next);

    const currentSectionPosition = (current.section as any).position as number;
    const currentTutorialId = ((current.section as any).tutorial as any)
      .id as string;

    if (!previousItem) {
      const prevSection = await this.prisma.section.findFirst({
        where: {
          tutorialId: currentTutorialId,
          position: { lt: currentSectionPosition },
          items: {
            some: {
              OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
            },
          },
        },
        orderBy: { position: 'desc' },
        include: {
          items: {
            where: {
              OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
            },
            orderBy: { position: 'desc' },
            take: 1,
            select: {
              type: true,
              lesson: { select: { slug: true } },
              quiz: { select: { slug: true } },
            },
          },
        },
      });
      const item = prevSection?.items?.[0];
      if (item) previousItem = mapNeighbor(item);
    }

    if (!nextItem) {
      const nextSection = await this.prisma.section.findFirst({
        where: {
          tutorialId: currentTutorialId,
          position: { gt: currentSectionPosition },
          items: {
            some: {
              OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
            },
          },
        },
        orderBy: { position: 'asc' },
        include: {
          items: {
            where: {
              OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
            },
            orderBy: { position: 'asc' },
            take: 1,
            select: {
              type: true,
              lesson: { select: { slug: true } },
              quiz: { select: { slug: true } },
            },
          },
        },
      });
      const item = nextSection?.items?.[0];
      if (item) nextItem = mapNeighbor(item);
    }

    return {
      tutorial,
      section,
      item,
      previousItem,
      nextItem,
    } as any;
  }

  async increaseViews(tutorial: Tutorial): Promise<void> {
    if (!tutorial) return;
    const viewsCount = (tutorial.viewsCount || 0) + 1;
    await this.prisma.tutorial.update({
      where: { id: tutorial.id },
      data: { viewsCount },
    });
    (tutorial as any).viewsCount = viewsCount;
  }

  async increaseLessonViews(
    lesson: Lesson | { id: string; viewsCount?: number },
  ): Promise<void> {
    if (!lesson) return;
    const viewsCount = ((lesson as any).viewsCount || 0) + 1;
    await this.prisma.lesson.update({
      where: { id: (lesson as any).id },
      data: { viewsCount },
    });
    (lesson as any).viewsCount = viewsCount;
  }

  /**
   * По tutorial slug вернуть первый раздел (section) и первый контентный элемент (lesson/quiz) внутри него.
   * Возвращает null, если туториал не найден/не опубликован или нет подходящих элементов.
   */
  async getFirstPublishedItemByTutorialSlug(
    tutorialSlug: string,
  ): Promise<any | null> {
    if (!tutorialSlug) return null;
    const tutorialRaw = await this.prisma.tutorial.findFirst({
      where: { slug: tutorialSlug, status: { type: 'published' } },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
    });
    if (!tutorialRaw) return null;

    // Находим первый section, у которого есть хотя бы один lesson/quiz item
    const section = await this.prisma.section.findFirst({
      where: {
        tutorialId: tutorialRaw.id,
        items: {
          some: {
            OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
          },
        },
      },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        name: true,
        position: true,
        items: {
          where: {
            OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
          },
          orderBy: { position: 'asc' },
          take: 1,
          select: {
            id: true,
            type: true,
            position: true,
            lesson: {
              select: {
                id: true,
                name: true,
                slug: true,
                textContent: true,
                blocksContent: true,
                learningDuration: true,
                reactionsCount: true,
                commentsCount: true,
                viewsCount: true,
                readingTime: true,
                featuredImageUrl: true,
                featuredImageId: true,
              },
            },
            quiz: {
              select: {
                id: true,
                name: true,
                slug: true,
                description: true,
                passingScore: true,
                questions: {
                  select: {
                    id: true,
                    text: true,
                    position: true,
                    type: true,
                    options: {
                      select: { id: true, text: true, position: true },
                      orderBy: { position: 'asc' },
                    },
                  },
                  orderBy: { position: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!section || section.items.length === 0) return null;
    const firstItem = section.items[0];

    // Формируем компактный ответ
    if (firstItem.type === 'lesson' && firstItem.lesson) {
      return {
        // Не возвращаем здесь объект tutorial, чтобы избежать возможных циклических ссылок,
        // оставляем только необходимые данные: секцию и первый элемент
        section: {
          id: section.id,
          name: section.name,
          position: section.position,
        },
        item: {
          id: firstItem.id,
          type: 'lesson',
          position: firstItem.position,
          lesson: firstItem.lesson,
        },
      } as any;
    }
    if (firstItem.type === 'quiz' && firstItem.quiz) {
      return {
        section: {
          id: section.id,
          name: section.name,
          position: section.position,
        },
        item: {
          id: firstItem.id,
          type: 'quiz',
          position: firstItem.position,
          quiz: firstItem.quiz,
        },
      } as any;
    }

    return null;
  }

  /**
   * Получить опубликованный урок по паре slug'ов: tutorialSlug + lessonSlug
   */
  async getPublishedLessonBySlugs(tutorialSlug: string, lessonSlug: string) {
    if (!tutorialSlug || !lessonSlug) return null;
    const tutorialRaw = await this.prisma.tutorial.findFirst({
      where: { slug: tutorialSlug, status: { type: 'published' } },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
    });
    if (!tutorialRaw) return null;
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        slug: lessonSlug,
        // Используем relation-path фильтр для совместимости текущих Prisma типов
        sectionItem: { section: { tutorialId: tutorialRaw.id } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        textContent: true,
        blocksContent: true,
        learningDuration: true,
        reactionsCount: true,
        commentsCount: true,
        viewsCount: true,
        readingTime: true,
        featuredImageUrl: true,
        featuredImageId: true,
      },
    });
    if (!lesson) return null;
    // Находим текущий sectionItem для урока, чтобы вычислить соседей
    const currentItem = await this.prisma.sectionItem.findFirst({
      where: {
        lessonId: lesson.id,
        section: { tutorialId: tutorialRaw.id },
      },
      select: { id: true, type: true, position: true, sectionId: true },
    });

    let previousItem: any = null;
    let nextItem: any = null;
    if (currentItem) {
      const prev = await this.prisma.sectionItem.findFirst({
        where: {
          sectionId: currentItem.sectionId,
          position: { lt: currentItem.position },
          OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
        },
        orderBy: { position: 'desc' },
        select: {
          type: true,
          lesson: { select: { slug: true } },
          quiz: { select: { slug: true } },
        },
      });
      const next = await this.prisma.sectionItem.findFirst({
        where: {
          sectionId: currentItem.sectionId,
          position: { gt: currentItem.position },
          OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
        },
        orderBy: { position: 'asc' },
        select: {
          type: true,
          lesson: { select: { slug: true } },
          quiz: { select: { slug: true } },
        },
      });
      const mapNeighbor = (n: any): any =>
        !n
          ? null
          : {
              type: n.type,
              slug:
                n.type === 'lesson'
                  ? (n.lesson?.slug ?? null)
                  : (n.quiz?.slug ?? null),
            };
      previousItem = mapNeighbor(prev);
      nextItem = mapNeighbor(next);

      // Фолбэк к соседним секциям, если в текущей секции соседа нет
      if (!previousItem || !nextItem) {
        const sectionMeta = await this.prisma.section.findFirst({
          where: { id: currentItem.sectionId },
          select: { position: true, tutorialId: true },
        });
        if (sectionMeta) {
          if (!previousItem) {
            const prevSection = await this.prisma.section.findFirst({
              where: {
                tutorialId: sectionMeta.tutorialId,
                position: { lt: sectionMeta.position },
                items: {
                  some: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                },
              },
              orderBy: { position: 'desc' },
              include: {
                items: {
                  where: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                  orderBy: { position: 'desc' },
                  take: 1,
                  select: {
                    type: true,
                    lesson: { select: { slug: true } },
                    quiz: { select: { slug: true } },
                  },
                },
              },
            });
            const item = prevSection?.items?.[0];
            if (item) previousItem = mapNeighbor(item);
          }
          if (!nextItem) {
            const nextSection = await this.prisma.section.findFirst({
              where: {
                tutorialId: sectionMeta.tutorialId,
                position: { gt: sectionMeta.position },
                items: {
                  some: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                },
              },
              orderBy: { position: 'asc' },
              include: {
                items: {
                  where: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                  orderBy: { position: 'asc' },
                  take: 1,
                  select: {
                    type: true,
                    lesson: { select: { slug: true } },
                    quiz: { select: { slug: true } },
                  },
                },
              },
            });
            const item = nextSection?.items?.[0];
            if (item) nextItem = mapNeighbor(item);
          }
        }
      }
    }

    const tutorial = tutorialRaw as any;
    return { tutorial, lesson, previousItem, nextItem } as any;
  }

  /**
   * Получить опубликованный квиз по паре slug'ов: tutorialSlug + quizSlug
   */
  async getPublishedQuizBySlugs(tutorialSlug: string, quizSlug: string) {
    if (!tutorialSlug || !quizSlug) return null;
    const tutorialRaw = await this.prisma.tutorial.findFirst({
      where: { slug: tutorialSlug, status: { type: 'published' } },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
    });
    if (!tutorialRaw) return null;
    const quiz = await this.prisma.quiz.findFirst({
      where: {
        slug: quizSlug,
        // Используем relation-path фильтр для совместимости текущих Prisma типов
        sectionItem: { section: { tutorialId: tutorialRaw.id } },
      },
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        passingScore: true,
        questions: {
          select: {
            id: true,
            text: true,
            position: true,
            type: true,
            options: {
              select: {
                id: true,
                text: true,
                position: true,
                // Не возвращаем isCorrect в публичном API
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });
    if (!quiz) return null;
    // Находим текущий sectionItem для квиза, чтобы вычислить соседей
    const currentItem = await this.prisma.sectionItem.findFirst({
      where: {
        quizId: quiz.id,
        section: { tutorialId: tutorialRaw.id },
      },
      select: { id: true, type: true, position: true, sectionId: true },
    });

    let previousItem: any = null;
    let nextItem: any = null;
    if (currentItem) {
      const prev = await this.prisma.sectionItem.findFirst({
        where: {
          sectionId: currentItem.sectionId,
          position: { lt: currentItem.position },
          OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
        },
        orderBy: { position: 'desc' },
        select: {
          type: true,
          lesson: { select: { slug: true } },
          quiz: { select: { slug: true } },
        },
      });
      const next = await this.prisma.sectionItem.findFirst({
        where: {
          sectionId: currentItem.sectionId,
          position: { gt: currentItem.position },
          OR: [{ lessonId: { not: null } }, { quizId: { not: null } }],
        },
        orderBy: { position: 'asc' },
        select: {
          type: true,
          lesson: { select: { slug: true } },
          quiz: { select: { slug: true } },
        },
      });
      const mapNeighbor = (n: any): any =>
        !n
          ? null
          : {
              type: n.type,
              slug:
                n.type === 'lesson'
                  ? (n.lesson?.slug ?? null)
                  : (n.quiz?.slug ?? null),
            };
      previousItem = mapNeighbor(prev);
      nextItem = mapNeighbor(next);

      // Фолбэк к соседним секциям
      if (!previousItem || !nextItem) {
        const sectionMeta = await this.prisma.section.findFirst({
          where: { id: currentItem.sectionId },
          select: { position: true, tutorialId: true },
        });
        if (sectionMeta) {
          if (!previousItem) {
            const prevSection = await this.prisma.section.findFirst({
              where: {
                tutorialId: sectionMeta.tutorialId,
                position: { lt: sectionMeta.position },
                items: {
                  some: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                },
              },
              orderBy: { position: 'desc' },
              include: {
                items: {
                  where: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                  orderBy: { position: 'desc' },
                  take: 1,
                  select: {
                    type: true,
                    lesson: { select: { slug: true } },
                    quiz: { select: { slug: true } },
                  },
                },
              },
            });
            const item = prevSection?.items?.[0];
            if (item) previousItem = mapNeighbor(item);
          }
          if (!nextItem) {
            const nextSection = await this.prisma.section.findFirst({
              where: {
                tutorialId: sectionMeta.tutorialId,
                position: { gt: sectionMeta.position },
                items: {
                  some: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                },
              },
              orderBy: { position: 'asc' },
              include: {
                items: {
                  where: {
                    OR: [
                      { lessonId: { not: null } },
                      { quizId: { not: null } },
                    ],
                  },
                  orderBy: { position: 'asc' },
                  take: 1,
                  select: {
                    type: true,
                    lesson: { select: { slug: true } },
                    quiz: { select: { slug: true } },
                  },
                },
              },
            });
            const item = nextSection?.items?.[0];
            if (item) nextItem = mapNeighbor(item);
          }
        }
      }
    }

    const tutorial = tutorialRaw as any;
    return { tutorial, quiz, previousItem, nextItem } as any;
  }

  /**
   * Validate quiz question answers without exposing isCorrect flags publicly.
   * Returns markers for UI highlighting.
   */
  async validateQuizQuestion(
    tutorialSlug: string,
    quizSlug: string,
    questionId: string,
    selectedOptionIds: string[],
  ): Promise<{
    correct: boolean;
    correctOptionIds: string[];
    incorrectSelectedOptionIds: string[];
  } | null> {
    if (!tutorialSlug || !quizSlug || !questionId) return null;

    const tutorial = await this.prisma.tutorial.findFirst({
      where: { slug: tutorialSlug, status: { type: 'published' } },
      select: { id: true },
    });
    if (!tutorial) return null;

    const quiz = await this.prisma.quiz.findFirst({
      where: {
        slug: quizSlug,
        sectionItem: { section: { tutorialId: tutorial.id } },
      },
      select: { id: true },
    });
    if (!quiz) return null;

    const question = await this.prisma.question.findFirst({
      where: { id: questionId, quizId: quiz.id },
      select: {
        id: true,
        type: true,
        options: { select: { id: true, isCorrect: true } },
      },
    });
    if (!question) return null;

    const allOptionMap = new Map(
      question.options.map((o) => [o.id, { id: o.id, isCorrect: o.isCorrect }]),
    );
    const correctOptionIds = question.options
      .filter((o) => o.isCorrect)
      .map((o) => o.id);

    const uniqueSelected = Array.from(new Set(selectedOptionIds || [])).filter(
      (id) => allOptionMap.has(id),
    );

    const incorrectSelectedOptionIds = uniqueSelected.filter(
      (id) => !allOptionMap.get(id)!.isCorrect,
    );

    let correct = false;
    if (question.type === 'single') {
      // For radio: must match exactly one correct option
      correct =
        correctOptionIds.length === 1 &&
        uniqueSelected.length === 1 &&
        uniqueSelected[0] === correctOptionIds[0];
    } else if (question.type === 'multiple') {
      // For checkboxes: sets must match exactly
      const a = [...uniqueSelected].sort();
      const b = [...correctOptionIds].sort();
      correct = a.length === b.length && a.every((v, i) => v === b[i]);
    } else {
      // Unsupported type in public player for now
      correct = false;
    }

    return {
      correct,
      correctOptionIds,
      incorrectSelectedOptionIds,
    };
  }

  async archiveTutorial(tutorialId: string, user: User) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);

    if (tutorial.status.type === 'archived') {
      throw new BadRequestException('This tutorial is already archived.');
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      // Load relations for recompute before status change
      const full = await tx.tutorial.findUnique({
        where: { id: tutorialId },
        include: { topics: { select: { id: true } } },
      });

      const res = await tx.tutorial.update({
        where: { id: tutorialId },
        data: { status: { connect: { type: 'archived' } } },
      });

      // Recompute counters only if it was published before
      if (tutorial.status.type === 'published' && full) {
        await this.recomputeUserTutorialsCount(tx, full.authorId);
        if (full.channelId) {
          await this.recomputeChannelTutorialsCount(tx, full.channelId);
        }
        const topicIds = (full.topics || []).map((t) => t.id);
        await this.recomputeTopicsTutorialsCount(tx, topicIds);
      }

      return res;
    });

    await this.feed.onUnpublished({
      targetType: 'tutorial',
      targetId: tutorialId,
    });
    return updated;
  }

  async getInstructorTutorials(
    userId: string,
    query: InstructorTutorialsQueryDto,
  ) {
    const { page, limit, status } = query;
    const skip = (page - 1) * limit;
    const whereClause: Prisma.TutorialWhereInput = { authorId: userId };
    if (status) {
      whereClause.status = { type: status };
    }
    const [total, tutorials] = await this.prisma.$transaction([
      this.prisma.tutorial.count({ where: whereClause }),
      this.prisma.tutorial.findMany({
        where: whereClause,
        skip,
        take: limit,
        include: {
          status: true,
          channel: true,
        },
        orderBy: { updatedAt: 'desc' },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    return {
      tutorials,
      pagination: {
        totalItems: total,
        itemCount: tutorials.length,
        itemsPerPage: limit,
        totalPages,
        currentPage: page,
      },
    };
  }

  async getInstructorTutorialsGroupedByStatuses(userId: string) {
    return this.prisma.tutorialStatus.findMany({
      include: {
        tutorials: {
          where: {
            authorId: userId,
          },
          orderBy: {
            updatedAt: 'desc',
          },
          include: {
            channel: true,
          },
        },
      },
    });
  }

  async getTutorialOverview(tutorialId: string, user?: User) {
    let tutorial;
    try {
      tutorial = await this.prisma.tutorial.findUniqueOrThrow({
        where: { id: tutorialId },
        include: {
          author: true,
          status: true,
          channel: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tutorial not found');
    }

    const isOwner = user && tutorial.authorId === user.id;

    // If owner is requesting and a draft exists for the same root, prefer returning the draft
    if (isOwner) {
      const rootId = tutorial.rootId ?? tutorial.id;
      const draft = await this.prisma.tutorial.findFirst({
        where: { rootId, status: { type: 'unpublishedChanges' } },
        include: { author: true, status: true, channel: true },
      });
      if (draft) {
        tutorial = draft;
      }
    }

    if (tutorial.status.type !== 'published' && !isOwner) {
      throw new ForbiddenException('You do not have access to this tutorial.');
    }

    return tutorial;
  }

  async getTutorialSettings(tutorialId: string, user: User) {
    // For Studio Settings we must ALWAYS work with a draft version.
    // 1) Ensure user owns the tutorial
    const current = await this.checkTutorialOwnership(tutorialId, user.id);
    // 2) If the tutorial is published – create/find a draft and return it instead
    const targetId =
      current.status.type === 'published'
        ? (await this.ensureDraftForRoot(current)).id
        : current.id;

    // Load all relations required by the Studio Settings UI from the target (draft) tutorial
    let dbTutorial;
    try {
      dbTutorial = await this.prisma.tutorial.findUniqueOrThrow({
        where: { id: targetId },
        include: {
          author: true,
          status: true,
          channel: true,
          topics: true,
          licenseType: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tutorial not found');
    }

    // Safety net: draft slug must never be empty. If somehow missing, generate and persist it.
    if (!dbTutorial.slug || dbTutorial.slug.trim() === '') {
      await this.prisma.$transaction(async (tx) => {
        const newSlug = await this.generateUniqueSlug(
          tx,
          (dbTutorial.title ?? 'tutorial') + ' draft',
        );
        await tx.tutorial.update({
          where: { id: dbTutorial.id },
          data: { slug: newSlug },
        });
      });
      // Reload to reflect the new slug
      try {
        dbTutorial = await this.prisma.tutorial.findUniqueOrThrow({
          where: { id: targetId },
          include: {
            author: true,
            status: true,
            channel: true,
            topics: true,
            licenseType: true,
          },
        });
      } catch (error) {
        throw new NotFoundException('Tutorial not found');
      }
    }
    // Return actual DB values (metaTitle/metaDescription now exist on Tutorial)
    return {
      tutorial: dbTutorial as any,
    };
  }

  async tutorialSettingsUpdate(
    tutorialId: string,
    user: User,
    dto: TutorialSettingsDto,
  ) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);
    // If published – redirect changes to draft (auto-create if absent)
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);
      // Validate slug uniqueness against all other tutorials
      await this.assertTutorialSlugUnique(dto.slug, draft.id);
      const data: any = {};
      if (dto.slug !== undefined) data.slug = dto.slug;
      if ((dto as any).title !== undefined) data.title = (dto as any).title;
      if (dto.description !== undefined) data.description = dto.description;
      if (dto.whatYouWillLearn !== undefined)
        data.whatYouWillLearn = dto.whatYouWillLearn;
      if (dto.discussionEnabled !== undefined)
        data.discussionEnabled = dto.discussionEnabled;
      // pinned flag (new)
      if (dto.pinned !== undefined) data.pinned = dto.pinned;
      if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
      if (dto.metaDescription !== undefined)
        data.metaDescription = dto.metaDescription;
      // Channel relation (optional)
      if (dto.channelId !== undefined) {
        data.channel = dto.channelId
          ? { connect: { id: dto.channelId } }
          : { disconnect: true };
      }
      // LicenseType relation (required at DB level) — update only if provided
      if (dto.licenseTypeId) {
        data.licenseType = { connect: { id: dto.licenseTypeId } };
      }

      await this.prisma.$transaction(async (tx) => {
        await tx.tutorial.update({
          where: { id: draft.id },
          data: { ...data, hasChanges: true, updatedAt: new Date() },
        });

        // Sync topics if provided: resolve by id or by name (create if missing),
        // then detach missing and attach resolved
        if (dto.topics) {
          const incoming = dto.topics ?? [];

          const resolveTopicIds: string[] = [];
          for (const t of incoming as any[]) {
            if (t?.id) {
              resolveTopicIds.push(t.id);
              continue;
            }
            if (t?.name && typeof t.name === 'string') {
              // Try to find topic by name that is either global (tutorialId null) or already bound to this draft
              let topic = await tx.topic.findFirst({
                where: {
                  name: t.name,
                  OR: [{ tutorialId: null }, { tutorialId: draft.id }],
                },
              });
              if (!topic) {
                // Create a new topic, do not steal from other tutorials
                const slug = await this.generateUniqueTopicSlug(t.name, tx);
                topic = await tx.topic.create({
                  data: {
                    name: t.name,
                    slug,
                    createdAt: new Date(),
                    tutorial: { connect: { id: draft.id } },
                  },
                });
              } else if (!topic.tutorialId) {
                // Attach global topic to this draft
                topic = await tx.topic.update({
                  where: { id: topic.id },
                  data: { tutorialId: draft.id },
                });
              }
              resolveTopicIds.push(topic.id);
            }
          }

          const providedIds = new Set(resolveTopicIds);
          const currentTopics = await tx.topic.findMany({
            where: { tutorialId: draft.id },
            select: { id: true },
          });
          const currentIds = new Set(currentTopics.map((t) => t.id));
          const toDetach = [...currentIds].filter((id) => !providedIds.has(id));
          const toAttach = [...providedIds].filter((id) => !currentIds.has(id));
          if (toDetach.length) {
            await tx.topic.updateMany({
              where: { id: { in: toDetach } },
              data: { tutorialId: null },
            });
          }
          if (toAttach.length) {
            await tx.topic.updateMany({
              where: { id: { in: toAttach } },
              data: { tutorialId: draft.id },
            });
          }
        }
      });
      return { draftTutorialId: draft.id } as any;
    }

    // Draft – update in-place
    await this.assertTutorialSlugUnique(dto.slug, tutorialId);
    const data: any = {};
    if (dto.slug !== undefined) data.slug = dto.slug;
    if ((dto as any).title !== undefined) data.title = (dto as any).title;
    if (dto.description !== undefined) data.description = dto.description;
    if (dto.whatYouWillLearn !== undefined)
      data.whatYouWillLearn = dto.whatYouWillLearn;
    if (dto.discussionEnabled !== undefined)
      data.discussionEnabled = dto.discussionEnabled;
    // pinned flag (new)
    if (dto.pinned !== undefined) data.pinned = dto.pinned;
    if (dto.metaTitle !== undefined) data.metaTitle = dto.metaTitle;
    if (dto.metaDescription !== undefined)
      data.metaDescription = dto.metaDescription;
    if (dto.channelId !== undefined) {
      data.channel = dto.channelId
        ? { connect: { id: dto.channelId } }
        : { disconnect: true };
    }
    if (dto.licenseTypeId) {
      data.licenseType = { connect: { id: dto.licenseTypeId } };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.tutorial.update({
        where: { id: tutorialId },
        data: { ...data, hasChanges: true, updatedAt: new Date() },
      });
      if (dto.topics) {
        const incoming = dto.topics ?? [];
        const resolveTopicIds: string[] = [];
        for (const t of incoming as any[]) {
          if (t?.id) {
            resolveTopicIds.push(t.id);
            continue;
          }
          if (t?.name && typeof t.name === 'string') {
            let topic = await tx.topic.findFirst({
              where: {
                name: t.name,
                OR: [{ tutorialId: null }, { tutorialId }],
              },
            });
            if (!topic) {
              const slug = await this.generateUniqueTopicSlug(t.name, tx);
              topic = await tx.topic.create({
                data: {
                  name: t.name,
                  slug,
                  createdAt: new Date(),
                  tutorial: { connect: { id: tutorialId } },
                },
              });
            } else if (!topic.tutorialId) {
              topic = await tx.topic.update({
                where: { id: topic.id },
                data: { tutorialId },
              });
            }
            resolveTopicIds.push(topic.id);
          }
        }

        const providedIds = new Set(resolveTopicIds);
        const currentTopics = await tx.topic.findMany({
          where: { tutorialId },
          select: { id: true },
        });
        const currentIds = new Set(currentTopics.map((t) => t.id));
        const toDetach = [...currentIds].filter((id) => !providedIds.has(id));
        const toAttach = [...providedIds].filter((id) => !currentIds.has(id));
        if (toDetach.length) {
          await tx.topic.updateMany({
            where: { id: { in: toDetach } },
            data: { tutorialId: null },
          });
        }
        if (toAttach.length) {
          await tx.topic.updateMany({
            where: { id: { in: toAttach } },
            data: { tutorialId },
          });
        }
      }
    });
    return { draftTutorialId: tutorialId } as any;
  }

  async tutorialFeaturedImageUpdate(
    tutorialId: string,
    user: User,
    dto: TutorialFeaturedImageDto,
  ) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);
    // Redirect to draft if target tutorial is published
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);
      await this.prisma.tutorial.update({
        where: { id: draft.id },
        data: {
          featuredImageUrl: dto.featuredImageUrl,
          hasChanges: true,
          updatedAt: new Date(),
        },
      });
      return { draftTutorialId: draft.id } as any;
    }
    await this.prisma.tutorial.update({
      where: { id: tutorialId },
      data: {
        featuredImageUrl: dto.featuredImageUrl,
        hasChanges: true,
        updatedAt: new Date(),
      },
    });
    return { draftTutorialId: tutorialId } as any;
  }

  async getTutorialDetails(tutorialId: string, user?: User) {
    let tutorial;
    try {
      tutorial = await this.prisma.tutorial.findUniqueOrThrow({
        where: { id: tutorialId },
        include: {
          sections: {
            orderBy: { position: 'asc' },
            include: {
              items: {
                include: {
                  lesson: true,
                  quiz: true,
                },
                orderBy: {
                  position: 'asc',
                },
              },
            },
          },
          author: true,
          status: true,
          channel: true,
        },
      });
    } catch (error) {
      throw new NotFoundException('Tutorial not found');
    }

    const isOwner = user && tutorial.authorId === user.id;

    // If the caller is the owner and the tutorial is published, prefer returning an existing draft version
    if (isOwner && tutorial.status.type === 'published') {
      const rootId = tutorial.rootId ?? tutorial.id;
      const draft = await this.prisma.tutorial.findFirst({
        where: { rootId, status: { type: 'unpublishedChanges' } },
        include: {
          sections: {
            orderBy: { position: 'asc' },
            include: {
              items: {
                include: { lesson: true, quiz: true },
                orderBy: { position: 'asc' },
              },
            },
          },
          author: true,
          status: true,
          channel: true,
        },
      });
      if (draft) return draft;
    }

    if (tutorial.status.type !== 'published' && !isOwner) {
      throw new ForbiddenException('You do not have access to this tutorial.');
    }
    return tutorial;
  }

  async getTutorialCountForInstructorByStatus(
    userId: string,
    statusType: string,
  ): Promise<number> {
    const statusExists = await this.prisma.tutorialStatus.findUnique({
      where: { type: statusType },
    });
    if (!statusExists) {
      throw new BadRequestException(`Invalid status type: ${statusType}`);
    }
    return this.prisma.tutorial.count({
      where: { authorId: userId, status: { type: statusType } },
    });
  }

  async getTutorialsCountByInstructor(userId: string): Promise<number> {
    return this.prisma.tutorial.count({
      where: { authorId: userId },
    });
  }

  async addSection(tutorialId: string, user: User) {
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);
    // Ensure we add section to a draft, not to published
    let targetTutorialId = tutorialId;
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);
      targetTutorialId = draft.id;
    }
    const position = await this.prisma.section.count({
      where: { tutorialId: targetTutorialId },
    });
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const name = `Untitled Section ${position + 1} - ${randomSuffix}`;
    const created = await this.prisma.section.create({
      select: {
        id: true,
        name: true,
        items: true,
      },
      data: {
        name,
        position,
        tutorialId: targetTutorialId,
      },
    });
    await this.prisma.tutorial.update({
      where: { id: targetTutorialId },
      data: { hasChanges: true, updatedAt: new Date() },
    });
    return created;
  }

  async addLesson(sectionId: string, user: User) {
    let section;
    try {
      section = await this.prisma.section.findUniqueOrThrow({
        where: { id: sectionId },
        include: { tutorial: { include: { status: true } } },
      });
    } catch (error) {
      throw new NotFoundException('Section not found');
    }
    await this.checkTutorialOwnership(section.tutorial.id, user.id);

    // If tutorial is published – create/find draft and map section by stableKey (fallback by position)
    let targetSectionId = sectionId;
    let draftTutorialId: string | null = null;
    if (section.tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(section.tutorial);
      draftTutorialId = draft.id;
      // Try by stableKey first
      const byKey = await this.prisma.section.findFirst({
        where: { tutorialId: draft.id, stableKey: (section as any).stableKey },
      });
      if (byKey) targetSectionId = byKey.id;
      else {
        // Fallback by position
        const byPos = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
        targetSectionId = byPos.id;
      }
    }

    const position = await this.prisma.sectionItem.count({
      where: { sectionId: targetSectionId },
    });
    await this.prisma.section.update({
      where: { id: targetSectionId },
      data: {
        lessonsCount: {
          increment: 1,
        },
      },
    });
    await this.prisma.tutorial.update({
      where: {
        id:
          section.tutorial.status.type === 'published'
            ? (draftTutorialId as string)
            : section.tutorialId,
      },
      data: {
        lessonsCount: {
          increment: 1,
        },
        hasChanges: true,
        updatedAt: new Date(),
      },
    });
    const randomSuffixHex = crypto.randomBytes(4).toString('hex');
    const name = `Untitled Lesson ${position + 1} - ${randomSuffixHex}`;
    const isPublishedContext = section.tutorial.status.type === 'published';
    const effectiveTutorialId = isPublishedContext
      ? (draftTutorialId as string)
      : section.tutorialId;
    const lessonSlug = await this.generateUniqueLessonSlug(
      name,
      effectiveTutorialId,
    );
    const created = await this.prisma.sectionItem.create({
      select: {
        id: true,
        position: true,
        type: true,
        lesson: true,
      },
      data: {
        position,
        section: { connect: { id: targetSectionId } },
        type: 'lesson',
        status: {
          connect: {
            type: isPublishedContext ? 'unpublishedChanges' : 'draft',
          },
        },
        lesson: {
          create: {
            name,
            textContent: '',
            blocksContent: [],
            slug: lessonSlug,
            // Initialize readingTime for empty content
            readingTime: readingTime(''),
          },
        },
      },
    });
    // Пересчитываем aggregated readingTime для соответствующего туториала
    await this.recomputeTutorialReadingTime(effectiveTutorialId);
    return created;
  }

  async addQuiz(sectionId: string, user: User) {
    let section;
    try {
      section = await this.prisma.section.findUniqueOrThrow({
        where: { id: sectionId },
        include: { tutorial: { include: { status: true } } },
      });
    } catch (error) {
      throw new NotFoundException('Section not found');
    }
    await this.checkTutorialOwnership(section.tutorial.id, user.id);

    // Map to draft section if tutorial is published
    let targetSectionId = sectionId;
    let draftTutorialId: string | null = null;
    if (section.tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(section.tutorial);
      draftTutorialId = draft.id;
      const byKey = await this.prisma.section.findFirst({
        where: { tutorialId: draft.id, stableKey: (section as any).stableKey },
      });
      if (byKey) targetSectionId = byKey.id;
      else {
        const byPos = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
        targetSectionId = byPos.id;
      }
    }

    const position = await this.prisma.sectionItem.count({
      where: { sectionId: targetSectionId },
    });

    const randomSuffixHex = crypto.randomBytes(4).toString('hex');
    const name = `Untitled Quiz ${position + 1} - ${randomSuffixHex}`;
    const isPublishedContext = section.tutorial.status.type === 'published';
    const effectiveTutorialId = isPublishedContext
      ? (draftTutorialId as string)
      : section.tutorialId;
    const quizSlug = await this.generateUniqueQuizSlug(
      name,
      effectiveTutorialId,
    );

    const created = await this.prisma.$transaction(async (tx) => {
      const item = await tx.sectionItem.create({
        select: {
          id: true,
          position: true,
          type: true,
          quiz: true,
        },
        data: {
          position,
          section: { connect: { id: targetSectionId } },
          type: 'quiz',
          status: {
            connect: {
              type: isPublishedContext ? 'unpublishedChanges' : 'draft',
            },
          },
          quiz: {
            create: {
              name,
              slug: quizSlug,
              questionCount: 0,
            },
          },
        },
      });
      await this.recomputeTutorialQuizzesCount(tx, effectiveTutorialId);
      await tx.tutorial.update({
        where: { id: effectiveTutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });
      return item;
    });
    return created;
  }

  async saveQuizName(quizId: string, instructorId: string, dto: QuizNameDto) {
    // Load quiz with its section and tutorial to check ownership and status
    const quiz = await this.prisma.quiz.findFirstOrThrow({
      where: {
        id: quizId,
        sectionItem: { section: { tutorial: { authorId: instructorId } } },
      },
      include: {
        sectionItem: {
          include: {
            section: { include: { tutorial: { include: { status: true } } } },
          },
        },
      },
    });

    const section = quiz.sectionItem?.section as any;
    const tutorial = section?.tutorial as Tutorial & {
      status: { type: string };
    };

    if (!tutorial) throw new NotFoundException('Tutorial not found');

    let targetQuizId = quiz.id;
    let targetTutorialId = tutorial.id;

    // When source tutorial is published – map to draft
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);
      targetTutorialId = draft.id;

      // Map section by stableKey first, fallback to position
      const sectionStableKey: string | undefined = section?.stableKey;
      let draftSection = sectionStableKey
        ? await this.prisma.section.findFirst({
            where: { tutorialId: draft.id, stableKey: sectionStableKey },
          })
        : null;
      if (!draftSection) {
        draftSection = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
      }

      const itemStableKey: string | undefined = (quiz.sectionItem as any)
        ?.stableKey;
      const itemPosition: number = (quiz.sectionItem as any)?.position;
      let draftItem = itemStableKey
        ? await this.prisma.sectionItem.findFirst({
            where: { sectionId: draftSection.id, stableKey: itemStableKey },
            include: { quiz: true },
          })
        : null;
      if (!draftItem) {
        draftItem = await this.prisma.sectionItem.findFirstOrThrow({
          where: { sectionId: draftSection.id, position: itemPosition },
          include: { quiz: true },
        });
      }

      if (!draftItem.quiz?.id)
        throw new NotFoundException('Draft quiz not found');
      targetQuizId = draftItem.quiz.id;
    }

    const currentQuiz = await this.findQuizDraftById(targetQuizId);

    const draftData: any = { name: dto.name };
    if (!currentQuiz.slug) {
      // Determine tutorialId for scoped uniqueness
      const tId =
        (currentQuiz as any).tutorialId ??
        (currentQuiz as any).sectionItem?.section?.tutorialId ??
        targetTutorialId;
      draftData.slug = await this.generateUniqueQuizSlug(dto.name, tId);
    }

    const updatedDraft = await this.updateQuizDraftSnapshot(
      currentQuiz,
      draftData,
    );

    await this.prisma.quiz.update({
      where: { id: targetQuizId },
      data: {
        hasChanges: true,
        updatedAt: new Date(),
      },
    });

    await this.prisma.tutorial.update({
      where: { id: targetTutorialId },
      data: { hasChanges: true, updatedAt: new Date() },
    });

    return {
      draftQuizId: targetQuizId,
      draftTutorialId: targetTutorialId,
      ...updatedDraft,
    } as any;
  }

  /**
   * Load quiz for studio editing by id with ownership checks.
   * If the parent tutorial is published, returns the corresponding quiz from the draft copy
   * (creating the draft if needed) so edits are applied to the draft.
   */
  async getQuiz(quizId: string, instructorId: string) {
    // Load source quiz with relations to determine tutorial and status
    const srcQuiz = await this.prisma.quiz.findFirstOrThrow({
      where: {
        id: quizId,
        sectionItem: { section: { tutorial: { authorId: instructorId } } },
      },
      include: {
        sectionItem: {
          include: {
            section: { include: { tutorial: { include: { status: true } } } },
          },
        },
      },
    });

    const section = srcQuiz.sectionItem?.section as any;
    const tutorial = section?.tutorial as Tutorial & {
      status: { type: string };
    };

    if (!tutorial) throw new NotFoundException('Tutorial not found');

    let targetQuizId = srcQuiz.id;

    // If published, map to draft counterpart
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);

      // Resolve draft section by stableKey first, fallback to position
      const sectionStableKey: string | undefined = section?.stableKey;
      let draftSection = sectionStableKey
        ? await this.prisma.section.findFirst({
            where: { tutorialId: draft.id, stableKey: sectionStableKey },
          })
        : null;
      if (!draftSection) {
        draftSection = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
      }

      // Resolve draft section item by stableKey first, fallback to position
      const srcItem = srcQuiz.sectionItem as any;
      const itemStableKey: string | undefined = srcItem?.stableKey;
      let draftItem = itemStableKey
        ? await this.prisma.sectionItem.findFirst({
            where: { sectionId: draftSection.id, stableKey: itemStableKey },
            include: { quiz: true },
          })
        : null;
      if (!draftItem) {
        draftItem = await this.prisma.sectionItem.findFirstOrThrow({
          where: { sectionId: draftSection.id, position: srcItem.position },
          include: { quiz: true },
        });
      }

      targetQuizId = draftItem.quiz?.id;
      if (!targetQuizId) throw new NotFoundException('Draft quiz not found');
    }

    return this.findQuizDraftById(targetQuizId);
  }

  /**
   * Persist quiz content (title, questions, options) for studio editing.
   * If the parent tutorial is published, the content is saved into the draft copy.
   * Completely replaces questions/options with provided payload, preserving order via `position`.
   */
  async saveQuizContent(
    quizId: string,
    instructorId: string,
    dto: SaveQuizContentDto,
  ) {
    // Load source quiz and determine target (draft if published)
    const srcQuiz = await this.prisma.quiz.findFirstOrThrow({
      where: {
        id: quizId,
        sectionItem: { section: { tutorial: { authorId: instructorId } } },
      },
      include: {
        sectionItem: {
          include: {
            section: { include: { tutorial: { include: { status: true } } } },
          },
        },
      },
    });

    const section = srcQuiz.sectionItem?.section as any;
    const tutorial = section?.tutorial as Tutorial & {
      status: { type: string };
    };
    if (!tutorial) throw new NotFoundException('Tutorial not found');

    let targetQuizId = srcQuiz.id;
    let targetTutorialId = tutorial.id;

    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial);
      targetTutorialId = draft.id;

      // Map to corresponding draft section
      const sectionStableKey: string | undefined = section?.stableKey;
      let draftSection = sectionStableKey
        ? await this.prisma.section.findFirst({
            where: { tutorialId: draft.id, stableKey: sectionStableKey },
          })
        : null;
      if (!draftSection) {
        draftSection = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
      }

      // Map to draft item
      const srcItem = srcQuiz.sectionItem as any;
      const itemStableKey: string | undefined = srcItem?.stableKey;
      let draftItem = itemStableKey
        ? await this.prisma.sectionItem.findFirst({
            where: { sectionId: draftSection.id, stableKey: itemStableKey },
            include: { quiz: true },
          })
        : null;
      if (!draftItem) {
        draftItem = await this.prisma.sectionItem.findFirstOrThrow({
          where: { sectionId: draftSection.id, position: srcItem.position },
          include: { quiz: true },
        });
      }

      if (!draftItem.quiz?.id)
        throw new NotFoundException('Draft quiz not found');
      targetQuizId = draftItem.quiz.id;
    }

    // Normalize payload
    const title = (dto.title ?? '').trim();
    const questions = Array.isArray(dto.questions) ? dto.questions : [];

    // Replace questions/options transactionally
    const updated = await this.prisma.$transaction(async (tx) => {
      const currentQuiz = await this.findQuizDraftById(targetQuizId);

      // Normalize payload
      const title = (dto.title ?? '').trim();
      const questions = Array.isArray(dto.questions) ? dto.questions : [];

      const draftData: any = {
        name: title.length > 0 ? title : currentQuiz.name,
        questions: questions.map((q, qi) => ({
          text: q.text ?? '',
          position: qi,
          type:
            q.type === SaveQuizQuestionType.MULTIPLE ? 'multiple' : 'single',
          imageUrl: (q as any).imageUrl ?? null,
          imageId: (q as any).imageId ?? null,
          options: (Array.isArray(q.options) ? q.options : []).map((o, oi) => ({
            text: o.text ?? '',
            isCorrect: Boolean(o.isCorrect),
            position: oi,
          })),
        })),
      };

      const updatedDraft = await this.updateQuizDraftSnapshot(
        currentQuiz,
        draftData,
      );

      await tx.quiz.update({
        where: { id: targetQuizId },
        data: {
          hasChanges: true,
          updatedAt: new Date(),
          questionCount: questions.length,
        },
      });

      await tx.tutorial.update({
        where: { id: targetTutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });

      return {
        draftQuizId: targetQuizId,
        draftTutorialId: targetTutorialId,
        ...updatedDraft,
      };
    });

    return updated;
  }

  private async findQuizDraftById(id: string) {
    const quiz = await this.prisma.quiz.findUniqueOrThrow({
      where: { id },
      include: {
        sectionItem: {
          include: {
            section: { include: { tutorial: { include: { status: true } } } },
          },
        },
        questions: {
          orderBy: { position: 'asc' },
          include: { options: { orderBy: { position: 'asc' } } },
        },
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (quiz.drafts?.[0]) {
      const draft = quiz.drafts[0].draft as any;
      return {
        ...quiz,
        name: draft.name ?? quiz.name,
        description: draft.description ?? quiz.description,
        slug: draft.slug ?? quiz.slug,
        passingScore: draft.passingScore ?? quiz.passingScore,
        questions:
          draft.questions?.map((q: any) => ({
            ...q,
            options: q.options?.map((o: any) => ({ ...o })),
          })) ?? quiz.questions,
      };
    }

    return quiz;
  }

  private async updateQuizDraftSnapshot(quiz: any, data: any) {
    const latestDraft = quiz.drafts?.[0];
    const draftVersionCreationInterval = await this.settingsService.findValueByName(
      'newDraftVersionCreationInterval',
      5,
    );
    const intervalMs = draftVersionCreationInterval * 60 * 1000;
    const now = new Date();

    const currentDraftData = (latestDraft?.draft as any) || {
      name: quiz.name,
      description: quiz.description,
      slug: quiz.slug,
      passingScore: quiz.passingScore,
      questions: quiz.questions.map((q: any) => ({
        text: q.text,
        position: q.position,
        type: q.type,
        imageUrl: q.imageUrl,
        imageId: q.imageId,
        options: q.options.map((o: any) => ({
          text: o.text,
          isCorrect: o.isCorrect,
          position: o.position,
        })),
      })),
    };

    const draftData = {
      ...currentDraftData,
      ...data,
    };

    if (
      latestDraft &&
      latestDraft.version !== quiz.lastPublishedDraftVersion &&
      now.getTime() - latestDraft.lastUpdateAt.getTime() < intervalMs
    ) {
      await this.prisma.quizDraft.update({
        where: { id: latestDraft.id },
        data: {
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    } else {
      await this.prisma.quizDraft.create({
        data: {
          quizId: quiz.id,
          version: (latestDraft?.version ?? 0) + 1,
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    }

    return draftData;
  }

  /**
   * Generate a unique slug for lesson using its name.
   */
  private async generateUniqueLessonSlug(
    name: string,
    tutorialId: string,
  ): Promise<string> {
    const base = slugify(name) || `lesson-${randomSuffix(6)}`;
    let candidate = base;
    for (let i = 0; i < 10; i++) {
      const exists = await this.prisma.lesson.findFirst({
        // Use relation path instead of direct tutorialId to avoid TS type mismatch before Prisma generate
        where: {
          slug: candidate,
          sectionItem: { section: { tutorialId } },
        },
      });
      if (!exists) return candidate;
      candidate = `${base}-${randomSuffix(4)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  /**
   * Generate a unique slug for quiz using its name.
   */
  private async generateUniqueQuizSlug(
    name: string,
    tutorialId: string,
  ): Promise<string> {
    const base = slugify(name) || `quiz-${randomSuffix(6)}`;
    let candidate = base;
    for (let i = 0; i < 10; i++) {
      const exists = await this.prisma.quiz.findFirst({
        // Use relation path instead of direct tutorialId to avoid TS type mismatch before Prisma generate
        where: {
          slug: candidate,
          sectionItem: { section: { tutorialId } },
        },
      });
      if (!exists) return candidate;
      candidate = `${base}-${randomSuffix(4)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  /**
   * Generate a globally unique slug for Topic using its name.
   */
  private async generateUniqueTopicSlug(
    name: string,
    tx: any,
  ): Promise<string> {
    const base = slugify(name) || `topic-${randomSuffix(6)}`;
    let candidate = base;
    for (let i = 0; i < 10; i++) {
      const exists = await tx.topic.findFirst({ where: { slug: candidate } });
      if (!exists) return candidate;
      candidate = `${base}-${randomSuffix(4)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  private async checkTutorialOwnership(tutorialId: string, userId: string) {
    const tutorial = await this.prisma.tutorial.findFirst({
      where: { id: tutorialId },
      include: { status: true },
    });
    if (!tutorial)
      throw new NotFoundException(
        await this.i18n.t('common.errors.tutorial_not_found'),
      );
    if (tutorial.authorId !== userId)
      throw new ForbiddenException(
        await this.i18n.t('common.errors.no_access_to_tutorial'),
      );
    return tutorial;
  }

  async changeSectionName(
    sectionId: string,
    user: User,
    dto: ChangeSectionNameDto,
  ) {
    // Load section with its tutorial to check ownership and status
    let section;
    try {
      section = await this.prisma.section.findUniqueOrThrow({
        where: { id: sectionId },
        include: { tutorial: { include: { status: true } } },
      });
    } catch (error) {
      throw new NotFoundException('Section not found');
    }
    await this.checkTutorialOwnership(section.tutorial.id, user.id);

    // If tutorial is published – update corresponding section in the draft
    if (section.tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(section.tutorial);
      // Try stableKey mapping first
      const draftSectionByKey = await this.prisma.section.findFirst({
        where: { tutorialId: draft.id, stableKey: (section as any).stableKey },
      });
      let targetSectionId = draftSectionByKey?.id;
      if (!targetSectionId) {
        const draftSectionByPos = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
        });
        targetSectionId = draftSectionByPos.id;
      }
      await this.prisma.section.update({
        where: { id: targetSectionId },
        data: { name: dto.name },
      });
      // Обновляем updatedAt у драфт-туториала
      await this.prisma.tutorial.update({
        where: { id: draft.id },
        data: { hasChanges: true, updatedAt: new Date() },
      });
      return { draftTutorialId: draft.id } as any;
    }

    // Draft – update in-place
    await this.prisma.section.update({
      where: { id: sectionId },
      data: { name: dto.name },
    });
    // Обновляем updatedAt у текущего (чернового) туториала
    await this.prisma.tutorial.update({
      where: { id: section.tutorialId },
      data: { hasChanges: true, updatedAt: new Date() },
    });
    return { draftTutorialId: section.tutorialId } as any;
  }

  /**
   * Reorder items inside a section. Accepts a list of SectionItem ids with their target positions (0-based).
   * Handles published tutorials by mapping to a draft section via stableKey/position, similar to other mutations.
   */
  async reorderSectionItems(
    sectionId: string,
    user: User,
    items: { id: string; position: number }[],
  ) {
    // Load section with tutorial and status to check ownership and decide draft mapping
    const section = await this.prisma.section.findUniqueOrThrow({
      where: { id: sectionId },
      include: { tutorial: { include: { status: true } } },
    });
    await this.checkTutorialOwnership(section.tutorial.id, user.id);

    // Determine target section (draft when source tutorial is published)
    let targetSectionId = sectionId;
    let targetTutorialId = section.tutorialId;
    if (section.tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(section.tutorial);
      targetTutorialId = draft.id;
      // Try stableKey first, fallback by position
      const byKey = await this.prisma.section.findFirst({
        where: { tutorialId: draft.id, stableKey: (section as any).stableKey },
        select: { id: true },
      });
      if (byKey) targetSectionId = byKey.id;
      else {
        const byPos = await this.prisma.section.findFirstOrThrow({
          where: { tutorialId: draft.id, position: section.position },
          select: { id: true },
        });
        targetSectionId = byPos.id;
      }
    }

    // Load existing items for validation (id + stableKey to support FE payloads)
    const existingItems = await this.prisma.sectionItem.findMany({
      where: { sectionId: targetSectionId },
      select: { id: true, stableKey: true },
      orderBy: { position: 'asc' },
    });

    // Build resolvers by id and stableKey
    const byId = new Map(existingItems.map((i) => [i.id, i.id]));
    const byKey = new Map(existingItems.map((i) => [i.stableKey, i.id]));

    // Resolve incoming identifiers: support either exact SectionItem `id`,
    // or `stableKey` provided either as separate field or in the `id` field.
    const resolved = (items ?? []).map((raw: any) => {
      const candidateKey = raw?.stableKey ?? raw?.id;
      const resolvedId = byId.get(raw?.id) ?? byKey.get(candidateKey);
      return {
        src: raw,
        id: resolvedId,
        // allow missing/undefined position: fallback to index order later
        position: typeof raw?.position === 'number' ? raw.position : null,
      };
    });

    // Validation: provided identifiers must be a non-empty subset of existing IDs (or empty -> no-op)
    const existingIdsList = existingItems.map((i) => i.id);
    const existingIds = new Set(existingIdsList);
    const providedIds = resolved
      .map((r) => r.id)
      .filter(Boolean) as string[] as string[];
    const providedIdsSet = new Set(providedIds);

    // Ensure there are no unknown ids
    for (const pid of providedIdsSet) {
      if (!existingIds.has(pid)) {
        throw new BadRequestException(
          'Items payload contains unknown item(s) for this section',
        );
      }
    }

    // If nothing to change, just return
    if (providedIds.length === 0) {
      return { updated: true };
    }

    // Build desired order for provided items: sort by provided "position" if present, else by input order
    const withOrder = resolved
      .filter((r) => !!r.id)
      .map((r, idx) => ({ id: r.id as string, order: r.position ?? idx }));
    withOrder.sort((a, b) => a.order - b.order);

    // Prepare new positions across ALL existing items (supporting partial updates)
    const n = existingIdsList.length;
    const occupied = new Array<boolean>(n).fill(false);
    const newOrder: (string | null)[] = new Array<string | null>(n).fill(null);

    // Helper to find next free slot starting from index (inclusive)
    const placeAtOrNext = (start: number): number => {
      let i = Math.max(0, Math.min(n - 1, start));
      for (; i < n; i++) if (!occupied[i]) return i;
      // fallback: search backwards
      for (i = Math.min(n - 1, start); i >= 0; i--) if (!occupied[i]) return i;
      return -1;
    };

    // Place provided items at desired indices (clamped) with collision resolution
    for (const it of withOrder) {
      const target = placeAtOrNext(it.order);
      if (target === -1) continue; // should not happen
      newOrder[target] = it.id;
      occupied[target] = true;
    }

    // Fill the remaining slots with items not included in the payload, preserving current relative order
    const remaining = existingIdsList.filter((id) => !providedIdsSet.has(id));
    let remIdx = 0;
    for (let pos = 0; pos < n; pos++) {
      if (!occupied[pos]) {
        newOrder[pos] = remaining[remIdx++];
        occupied[pos] = true;
      }
    }

    const normalized = newOrder.map((id, position) => ({
      id: id as string,
      position,
    }));

    await this.prisma.$transaction(async (tx) => {
      for (const it of normalized) {
        await tx.sectionItem.update({
          where: { id: it.id },
          data: { position: it.position },
        });
      }
      // touch tutorial updatedAt
      await tx.tutorial.update({
        where: { id: targetTutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });
    });

    return { updated: true };
  }

  /**
   * Reorder sections inside a tutorial. Accepts list of section ids with target positions (0-based).
   * If tutorial is published, reorders inside its draft copy (created on demand).
   */
  async reorderSections(
    tutorialId: string,
    user: User,
    items: { id: string; position: number }[],
  ) {
    // Ensure user owns the tutorial and fetch status
    const tutorial = await this.checkTutorialOwnership(tutorialId, user.id);

    // Determine where to apply changes: draft for published, original otherwise
    let targetTutorialId = tutorialId;
    if (tutorial.status.type === 'published') {
      const draft = await this.ensureDraftForRoot(tutorial as any);
      targetTutorialId = draft.id;
    }

    // Load existing sections to validate payload
    const existingSections = await this.prisma.section.findMany({
      where: { tutorialId: targetTutorialId },
      select: { id: true },
      orderBy: { position: 'asc' },
    });

    const existingIds = new Set(existingSections.map((s) => s.id));
    const providedIds = new Set((items ?? []).map((i) => i.id));
    if (existingIds.size !== providedIds.size) {
      throw new BadRequestException('Invalid sections payload');
    }
    for (const id of existingIds) {
      if (!providedIds.has(id)) {
        throw new BadRequestException(
          'Sections list does not match tutorial sections',
        );
      }
    }

    // Normalize positions according to provided positions order
    const normalized = [...items]
      .sort((a, b) => a.position - b.position)
      .map((it, idx) => ({ id: it.id, position: idx }));

    await this.prisma.$transaction(async (tx) => {
      for (const it of normalized) {
        await tx.section.update({
          where: { id: it.id },
          data: { position: it.position },
        });
      }
      await tx.tutorial.update({
        where: { id: targetTutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });
    });

    return { updated: true };
  }

  private validateTutorialForPublishing(tutorial: any): string[] {
    const errors: string[] = [];
    const title: string = (tutorial as any).title ?? '';
    if (!title || title.trim() === '') {
      errors.push('Title must be updated.');
    }
    if (
      tutorial.sections.length === 0 ||
      !tutorial.sections.some((s) => s.items.some((i) => i.lesson != null))
    )
      errors.push('Must have at least one lesson.');
    return errors;
  }

  /**
   * Ensure a draft version exists for the given tutorial root. If the given tutorial is published,
   * clone the current published version to a new draft with incremented revision; otherwise, if a draft
   * already exists for the same root, return it. Mirrors LessonsService.ensureDraftForRoot.
   */
  private async ensureDraftForRoot(publishedTutorial: any) {
    const rootId = publishedTutorial.rootId ?? publishedTutorial.id;

    const existingDraft = await this.prisma.tutorial.findFirst({
      where: { rootId, status: { type: 'unpublishedChanges' } },
    });
    if (existingDraft) return existingDraft;

    // Load source with full tree
    const source = await this.prisma.tutorial.findFirstOrThrow({
      where: { id: publishedTutorial.id },
      include: {
        sections: {
          include: {
            items: {
              include: {
                lesson: true,
                quiz: {
                  include: { questions: { include: { options: true } } },
                },
              },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    const maxRevision = await this.prisma.tutorial.aggregate({
      where: { rootId },
      _max: { revision: true },
    });
    const nextRevision =
      (maxRevision._max.revision ?? source.revision ?? 1) + 1;

    return await this.prisma.$transaction(async (tx) => {
      // Pre-compute quizzes count from source tree
      const quizzesCount = source.sections.reduce((acc, s) => {
        const items = [...s.items];
        return acc + items.filter((it) => !!(it as any).quiz).length;
      }, 0);
      const createdDraft = await tx.tutorial.create({
        data: {
          title: (source as any).title,
          description: source.description,
          featuredImageUrl: source.featuredImageUrl ?? undefined,
          author: { connect: { id: source.authorId } },
          channel: source.channelId
            ? { connect: { id: source.channelId } }
            : undefined,
          sectionsCount: source.sectionsCount,
          lessonsCount: source.lessonsCount,
          quizesCount: quizzesCount,
          learningDuration: source.learningDuration,
          status: { connect: { type: 'unpublishedChanges' } },
          root: { connect: { id: rootId } },
          revision: nextRevision,
          // slug will be assigned below to guarantee non-empty value
          slug: null,
          scheduledAt: null,
          // Preserve license type from source (required relation)
          licenseType: { connect: { id: (source as any).licenseTypeId } },
        },
      });

      // Assign a readable, unique slug for the newly created draft
      const baseForSlug = `${source.slug ?? source.title} draft`;
      const draftSlug = await this.generateUniqueSlug(tx, baseForSlug);
      await tx.tutorial.update({
        where: { id: createdDraft.id },
        data: { slug: draftSlug },
      });

      for (const section of source.sections) {
        const newSection = await tx.section.create({
          data: {
            name: section.name,
            position: section.position,
            stableKey: (section as any).stableKey,
            lessonsCount: section.lessonsCount,
            learningDuration: section.learningDuration,
            tutorialId: createdDraft.id,
          },
        });

        const items = [...section.items].sort(
          (a, b) => a.position - b.position,
        );
        for (const item of items) {
          if (item.lesson) {
            await tx.sectionItem.create({
              data: {
                type: 'lesson',
                position: item.position,
                isFreePreview: item.isFreePreview,
                stableKey: (item as any).stableKey,
                section: { connect: { id: newSection.id } },
                status: { connect: { type: 'unpublishedChanges' } },
                lesson: {
                  create: {
                    name: item.lesson.name,
                    // ВАЖНО: сохраняем slug исходного опубликованного урока,
                    // чтобы ссылки по slug продолжали работать и в драфте, и после публикации
                    slug: item.lesson.slug ?? null,
                    textContent: item.lesson.textContent,
                    blocksContent: item.lesson.blocksContent,
                    learningDuration: item.lesson.learningDuration,
                    // Preserve readingTime if present; otherwise compute from textContent
                    readingTime:
                      (item.lesson as any).readingTime ??
                      readingTime(item.lesson.textContent ?? ''),
                  },
                },
              },
            });
          } else if (item.quiz) {
            await tx.sectionItem.create({
              data: {
                type: 'quiz',
                position: item.position,
                isFreePreview: item.isFreePreview,
                stableKey: (item as any).stableKey,
                section: { connect: { id: newSection.id } },
                status: { connect: { type: 'unpublishedChanges' } },
                quiz: {
                  create: {
                    name: item.quiz.name,
                    // Аналогично сохраняем исходный slug викторины
                    slug: item.quiz.slug ?? null,
                    description: item.quiz.description,
                    passingScore: item.quiz.passingScore,
                    // cache number of questions for quick access
                    questionCount: Array.isArray(item.quiz.questions)
                      ? item.quiz.questions.length
                      : 0,
                    questions: {
                      create: item.quiz.questions.map((q) => ({
                        text: q.text,
                        position: q.position,
                        type: q.type,
                        explanation: (q as any).explanation ?? [],
                        imageUrl: (q as any).imageUrl ?? null,
                        image: (q as any).imageId
                          ? { connect: { id: (q as any).imageId } }
                          : undefined,
                        options: {
                          create: q.options.map((o) => ({
                            text: o.text,
                            isCorrect: o.isCorrect,
                            position: o.position,
                          })),
                        },
                      })),
                    },
                  },
                },
              },
            });
          } else {
            await tx.sectionItem.create({
              data: {
                type: item.type,
                position: item.position,
                isFreePreview: item.isFreePreview,
                stableKey: (item as any).stableKey,
                section: { connect: { id: newSection.id } },
                status: { connect: { type: 'unpublishedChanges' } },
              },
            });
          }
        }
      }

      // После полного копирования пересчитываем aggregated readingTime для драфта
      await this.recomputeTutorialReadingTime(createdDraft.id);
      return createdDraft;
    });
  }

  /**
   * Ensure that provided tutorial slug is unique across all tutorials
   * (excluding the record with excludeId if provided). Throws 400 if taken.
   */
  private async assertTutorialSlugUnique(slug: string, excludeId?: string) {
    if (!slug) return; // other validators handle required/format

    const tutorial = await this.prisma.tutorial.findUnique({
      where: { id: excludeId },
      select: { rootId: true },
    });

    const exists = await this.prisma.tutorial.findFirst({
      where: {
        slug,
        AND: [
          ...(excludeId ? [{ NOT: { id: excludeId } }] : []),
          ...(tutorial?.rootId ? [{ NOT: { id: tutorial.rootId } }] : []),
          ...(tutorial?.rootId ? [{ NOT: { rootId: tutorial.rootId } }] : []),
        ],
      },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('Slug is already taken');
    }
  }
}
