import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { LessonContentDto } from '@/tutorials/application/dto/lesson-content.dto';
import { LessonNameDto } from '@/tutorials/application/dto/lesson-name.dto';
import { randomSuffix, slugify } from '@/common/application/utils/slug.util';
import { readingTime } from 'reading-time-estimator';
import { ContentBlocksToTextConverter } from '@/common/application/services/content-blocks-to-text-converter.service';
import { SettingsService } from '@/settings/application/services/settings.service';

@Injectable()
export class LessonsService {
  constructor(
    private prisma: PrismaService,
    private contentBlocksToTextConverter: ContentBlocksToTextConverter,
    private settingsService: SettingsService,
  ) {}

  private async recomputeTutorialReadingTime(tutorialId: string) {
    const lessons = await this.prisma.lesson.findMany({
      where: {
        sectionItem: {
          section: {
            tutorialId,
          },
        },
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

    // Build display text based on rounded minutes
    const roundedMinutes = Math.max(0, Math.ceil(totalMinutes));
    const text =
      roundedMinutes > 0 ? `${roundedMinutes} min read` : 'less than a minute';

    // Use updateMany to avoid throwing if the tutorial record no longer exists
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

  async getLesson(lessonId: string, instructorId: string) {
    // Determine the target lesson for editing: if the tutorial is published,
    // use a draft copy (create/find if necessary), otherwise use the original.
    const { targetLessonId } = await this.ensureDraftLessonTarget(
      lessonId,
      instructorId,
    );

    return this.findLessonDraftById(targetLessonId);
  }

  async saveLessonContent(
    lessonId: string,
    instructorId: string,
    dto: LessonContentDto,
  ) {
    const target = await this.ensureDraftLessonTarget(lessonId, instructorId);
    const lesson = await this.findLessonDraftById(target.targetLessonId);

    const textContent = this.contentBlocksToTextConverter.convert(
      dto.blocksContent as any[],
    );

    const draftData = await this.updateDraftSnapshot(lesson, {
      textContent,
      blocksContent: dto.blocksContent,
      readingTime: readingTime(textContent),
    });

    await this.prisma.lesson.update({
      where: { id: target.targetLessonId },
      data: {
        hasChanges: true,
        updatedAt: new Date(),
      },
    });

    // Update updatedAt of the corresponding draft or current tutorial
    const tutorialId = target.draftTutorialId;
    if (tutorialId) {
      // Update updatedAt
      await this.prisma.tutorial.update({
        where: { id: tutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });
      // Recompute aggregated readingTime at the Tutorial level
      await this.recomputeTutorialReadingTime(tutorialId);
    }

    return {
      draftLessonId: target.targetLessonId,
      draftTutorialId: target.draftTutorialId,
      ...draftData,
    };
  }

  async saveLessonName(
    lessonId: string,
    instructorId: string,
    dto: LessonNameDto,
  ) {
    const target = await this.ensureDraftLessonTarget(lessonId, instructorId);
    const lesson = await this.findLessonDraftById(target.targetLessonId);

    const draftData: any = { name: dto.name };
    if (!lesson.slug) {
      // Determine tutorialId for scoped uniqueness: prefer direct field, fallback to relation
      const tutorialId =
        lesson.tutorialId ??
        lesson.sectionItem?.section?.tutorialId ??
        null;
      if (tutorialId) {
        draftData.slug = await this.generateUniqueLessonSlug(dto.name, tutorialId);
      }
    }

    const updatedDraft = await this.updateDraftSnapshot(lesson, draftData);

    await this.prisma.lesson.update({
      where: { id: target.targetLessonId },
      data: {
        hasChanges: true,
        updatedAt: new Date(),
      },
    });

    // Update updatedAt of the corresponding draft or current tutorial
    const tutorialId = target.draftTutorialId;
    if (tutorialId) {
      await this.prisma.tutorial.update({
        where: { id: tutorialId },
        data: { hasChanges: true, updatedAt: new Date() },
      });
    }

    return {
      draftLessonId: target.targetLessonId,
      draftTutorialId: target.draftTutorialId,
      ...updatedDraft,
    };
  }

  private async findLessonDraftById(id: string) {
    const lesson = await this.prisma.lesson.findUniqueOrThrow({
      where: { id },
      include: {
        sectionItem: {
          include: { section: { include: { tutorial: true } } },
        },
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (lesson.drafts?.[0]) {
      const draft = lesson.drafts[0].draft as any;
      return {
        ...lesson,
        name: draft.name ?? lesson.name,
        textContent: draft.textContent ?? lesson.textContent,
        blocksContent: draft.blocksContent ?? lesson.blocksContent,
        readingTime: draft.readingTime ?? lesson.readingTime,
        slug: draft.slug ?? lesson.slug,
        learningDuration: draft.learningDuration ?? lesson.learningDuration,
        featuredImageUrl: draft.featuredImageUrl ?? lesson.featuredImageUrl,
        featuredImageId: draft.featuredImageId ?? lesson.featuredImageId,
      };
    }

    return lesson;
  }

  private async updateDraftSnapshot(lesson: any, data: any) {
    const latestDraft = lesson.drafts?.[0];
    const draftVersionCreationInterval = await this.settingsService.findValueByName(
      'newDraftVersionCreationInterval',
      5,
    );
    const intervalMs = draftVersionCreationInterval * 60 * 1000;
    const now = new Date();

    const currentDraftData = (latestDraft?.draft as any) || {
      name: lesson.name,
      textContent: lesson.textContent,
      blocksContent: lesson.blocksContent,
      readingTime: lesson.readingTime,
      slug: lesson.slug,
      learningDuration: lesson.learningDuration,
      featuredImageUrl: lesson.featuredImageUrl,
      featuredImageId: lesson.featuredImageId,
    };

    const draftData = {
      ...currentDraftData,
      ...data,
    };

    if (
      latestDraft &&
      latestDraft.version !== lesson.lastPublishedDraftVersion &&
      now.getTime() - latestDraft.lastUpdateAt.getTime() < intervalMs
    ) {
      await this.prisma.lessonDraft.update({
        where: { id: latestDraft.id },
        data: {
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    } else {
      await this.prisma.lessonDraft.create({
        data: {
          lessonId: lesson.id,
          version: (latestDraft?.version ?? 0) + 1,
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    }

    return draftData;
  }

  /**
   * Generate a unique slug for a lesson within the given tutorial.
   */
  private async generateUniqueLessonSlug(
    name: string,
    tutorialId: string,
  ): Promise<string> {
    const base = slugify(name) || `lesson-${randomSuffix(6)}`;
    let candidate = base;
    for (let i = 0; i < 10; i++) {
      const exists = await this.prisma.lesson.findFirst({
        // Use relation filter path to remain compatible with current Prisma Client types
        where: {
          slug: candidate,
          sectionItem: { section: { tutorialId } },
        },
        select: { id: true },
      });
      if (!exists) return candidate;
      candidate = `${base}-${randomSuffix(4)}`;
    }
    return `${base}-${Date.now().toString(36)}`;
  }

  private async ensureDraftLessonTarget(
    lessonId: string,
    instructorId: string,
  ): Promise<{ targetLessonId: string; draftTutorialId: string | null }> {
    // Load the lesson with its section, tutorial and positions
    const lesson = await this.prisma.lesson.findFirstOrThrow({
      where: {
        id: lessonId,
        sectionItem: {
          section: { tutorial: { authorId: instructorId } },
        },
      },
      include: {
        sectionItem: {
          include: {
            section: {
              include: {
                tutorial: { include: { status: true } },
                items: true,
              },
            },
          },
        },
      },
    });

    const tutorial = lesson.sectionItem!.section.tutorial;
    const isPublished = tutorial.status?.type === 'published';

    // If not published, we can edit directly
    if (!isPublished)
      return { targetLessonId: lessonId, draftTutorialId: null };

    // Determine stable keys and positions for mapping
    const section = lesson.sectionItem!.section as any;
    const sectionStableKey: string | undefined = section.stableKey;
    const sectionItemStableKey: string | undefined = (lesson.sectionItem as any)
      .stableKey;
    const sectionPosition = section.position;
    const sectionItemPosition = lesson.sectionItem!.position;

    // Ensure there's a draft for this root
    const draftTutorial = await this.ensureDraftForRoot(tutorial);

    // Prefer mapping by stableKey, fallback to position if keys are missing (legacy)
    let draftSection = await this.prisma.section.findFirst({
      where: {
        tutorialId: draftTutorial.id,
        ...(sectionStableKey
          ? { stableKey: sectionStableKey }
          : { position: sectionPosition }),
      },
    });
    if (!draftSection) {
      // Fallback strictly by position to avoid throwing if legacy data without keys
      draftSection = await this.prisma.section.findFirstOrThrow({
        where: { tutorialId: draftTutorial.id, position: sectionPosition },
      });
    }

    let draftSectionItem = await this.prisma.sectionItem.findFirst({
      where: {
        sectionId: draftSection.id,
        ...(sectionItemStableKey
          ? { stableKey: sectionItemStableKey }
          : { position: sectionItemPosition }),
        lessonId: { not: null },
      },
      include: { lesson: true },
    });
    if (!draftSectionItem) {
      draftSectionItem = await this.prisma.sectionItem.findFirstOrThrow({
        where: {
          sectionId: draftSection.id,
          position: sectionItemPosition,
          lessonId: { not: null },
        },
        include: { lesson: true },
      });
    }

    return {
      targetLessonId: draftSectionItem.lesson!.id,
      draftTutorialId: draftTutorial.id,
    };
  }

  private async ensureDraftForRoot(publishedTutorial: any) {
    // Try to find existing draft version for the same root
    const rootId = publishedTutorial.rootId ?? publishedTutorial.id;

    const existingDraft = await this.prisma.tutorial.findFirst({
      where: {
        rootId,
        status: { type: 'unpublishedChanges' },
      },
    });

    if (existingDraft) return existingDraft;

    // Find current published (source) and max revision
    const source = await this.prisma.tutorial.findFirstOrThrow({
      where: { id: publishedTutorial.id },
      include: {
        sections: {
          include: {
            items: {
              include: {
                lesson: true,
                quiz: {
                  include: {
                    questions: { include: { options: true } },
                  },
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

    // Clone entire tree in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Pre-compute quizzes count from source
      const quizzesCount = source.sections.reduce((acc, s) => {
        const items = [...s.items];
        return acc + items.filter((it) => !!(it as any).quiz).length;
      }, 0);

      const createdDraft = await tx.tutorial.create({
        data: {
          title: (source as any).title,
          description: source.description,
          featuredImageUrl: source.featuredImageUrl ?? undefined,
          // relations (checked create input):
          author: { connect: { id: source.authorId } },
          channel: source.channelId
            ? { connect: { id: source.channelId } }
            : undefined,
          sectionsCount: source.sectionsCount,
          lessonsCount: source.lessonsCount,
          quizesCount: quizzesCount,
          learningDuration: source.learningDuration,
          // working version of changes for the publication
          status: { connect: { type: 'unpublishedChanges' } },
          root: { connect: { id: rootId } },
          revision: nextRevision,
          // Draft should not occupy a unique slug until published
          slug: null,
          scheduledAt: null,
          // Preserve license type from source (required relation in schema)
          licenseType: { connect: { id: (source as any).licenseTypeId } },
        },
      });

      // Clone sections and items
      for (const section of source.sections) {
        const newSection = await tx.section.create({
          data: {
            name: section.name,
            position: section.position,
            // Preserve stableKey to enable stable mapping across versions
            stableKey: (section as any).stableKey,
            lessonsCount: section.lessonsCount,
            learningDuration: section.learningDuration,
            tutorial: { connect: { id: createdDraft.id } },
          },
        });

        // Ensure stable order by position when iterating items
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
                // Preserve stableKey for stable mapping
                stableKey: (item as any).stableKey,
                section: { connect: { id: newSection.id } },
                status: { connect: { type: 'unpublishedChanges' } },
                lesson: {
                  create: {
                    name: item.lesson.name,
                    textContent: item.lesson.textContent,
                    blocksContent: item.lesson.blocksContent,
                    learningDuration: item.lesson.learningDuration,
                    readingTime: readingTime(item.lesson.textContent),
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
                    // Drafts and clones should not occupy a unique slug
                    slug: null,
                    description: item.quiz.description,
                    passingScore: item.quiz.passingScore,
                    // Cache number of questions for quick access
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
            // Unknown type: still copy metadata without linked entities
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

      return createdDraft;
    });
  }
}
