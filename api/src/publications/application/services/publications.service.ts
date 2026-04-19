import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { readingTime } from 'reading-time-estimator';
import { Publication, Topic, User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import {
  slugify,
  slugifyWithHash,
} from '@/common/infrastructure/utils/slugify';
import { FeaturedImageService } from '@/common/application/services/featured-image.service';
import { FeedService } from '@/feed/application/services/feed.service';
import { PublicationContentDto } from '@/publications/application/dtos/publication-content.dto';
import { PublicationSettingsDto } from '@/publications/application/dtos/publication-settings.dto';
import * as crypto from 'crypto';
import { SettingsService } from '@/settings/application/services/settings.service';
import { RecommendationService } from '@/common/application/services/recommendation.service';
import { ContentBlocksToTextConverter } from '@/common/application/services/content-blocks-to-text-converter.service';
import { TextQualityQueue } from '@/text-quality/text-quality.queue';

@Injectable()
export class PublicationsService {
  constructor(
    @Inject(forwardRef(() => PrismaService))
    private _prisma: PrismaService,
    @Inject(forwardRef(() => FeaturedImageService))
    private _featureImageService: FeaturedImageService,
    @Inject(forwardRef(() => FileStorageService))
    private _fileStorage: FileStorageService,
    private readonly feed: FeedService,
    private readonly settingsService: SettingsService,
    private readonly recommendationService: RecommendationService,
    @InjectQueue('publication-queue')
    private readonly publicationQueue: Queue,
    private readonly contentBlocksToTextConverter: ContentBlocksToTextConverter,
    private readonly textQualityQueue: TextQualityQueue,
  ) {}

  async exists(id: string): Promise<boolean> {
    return (
      (await this._prisma.publication.count({
        where: {
          id,
          status: {
            type: 'published',
          },
        },
      })) > 0
    );
  }

  async findBySlugOrFail(slug: string) {
    return this._prisma.publication.findFirstOrThrow({
      where: {
        slug,
        status: {
          type: 'published',
        },
      },
      include: {
        channel: {
          include: {
            visibility: true,
          },
        },
        author: true,
        topics: true,
      },
    });
  }

  async increaseViews(publication: Publication): Promise<void> {
    const viewsCount = publication.viewsCount + 1;
    await this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        viewsCount,
      },
    });
    publication.viewsCount = viewsCount;
  }

  async findOneByIdWithRelations(id: string) {
    return this._prisma.publication.findFirstOrThrow({
      where: {
        id,
        status: {
          type: 'published',
        },
      },
      include: {
        channel: true,
        author: true,
        topics: true,
      },
    });
  }

  async findByIdOrFail(id: string, options: any = {}) {
    return this._prisma.publication.findFirstOrThrow({
      where: {
        id,
        status: {
          type: 'published',
        },
      },
      ...options,
    });
  }

  async createDraft(author: User) {
    const maxDrafts = await this.settingsService.findValueByName(
      'maxDraftPublicationsPerUser',
      5,
    );
    const draftsCount = await this._prisma.publication.count({
      where: {
        authorId: author.id,
        status: {
          type: 'draft',
        },
      },
    });

    if (draftsCount >= maxDrafts) {
      throw new BadRequestException('MAX_DRAFTS_REACHED');
    }

    const draftStatus = await this._prisma.publicationStatus.findUniqueOrThrow({
      where: {
        type: 'draft',
      },
    });
    const articleType = await this._prisma.publicationType.findUniqueOrThrow({
      where: {
        type: 'article',
      },
    });
    const licenseType = await this._prisma.licenseType.findFirstOrThrow({
      where: {
        isDefault: true,
      },
    });
    const randomSuffix = crypto.randomBytes(4).toString('hex');
    const defaultTitle = `Untitled Publication - ${randomSuffix}`;
    const draftData = {
      title: defaultTitle,
      textContent: '',
      blocksContent: [],
    };
    const newPublication = await this._prisma.publication.create({
      data: {
        title: defaultTitle,
        hash: crypto.randomUUID(),
        textContent: '',
        slug: slugify(defaultTitle),
        blocksContent: [],
        pinned: false,
        author: {
          connect: {
            id: author.id,
          },
        },
        licenseType: {
          connect: {
            id: licenseType.id,
          },
        },
        readingTime: readingTime(''),
        status: {
          connect: {
            id: draftStatus.id,
          },
        },
        type: {
          connect: {
            id: articleType.id,
          },
        },
      },
    });

    await this._prisma.publicationDraft.create({
      data: {
        publicationId: newPublication.id,
        version: 1,
        lastUpdateAt: new Date(),
        draft: draftData,
      },
    });

    return newPublication;
  }

  async findDraftByHash(hash: string) {
    const publication = await this._prisma.publication.findFirstOrThrow({
      where: {
        hash,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        type: true,
        licenseType: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    const draft = publication.drafts?.[0]?.draft as any;
    if (draft) {
      return {
        ...publication,
        title: draft.title ?? publication.title,
        textContent: draft.textContent ?? publication.textContent,
        blocksContent: draft.blocksContent ?? publication.blocksContent,
      };
    }

    return publication;
  }

  private async updateDraftSnapshot(publication: any, data: any) {
    const latestDraft = publication.drafts?.[0];
    const draftVersionCreationInterval = await this.settingsService.findValueByName(
      'newDraftVersionCreationInterval',
      5,
    );
    const intervalMs = draftVersionCreationInterval * 60 * 1000;
    const now = new Date();

    const currentDraftData = (latestDraft?.draft as any) || {
      title: publication.title,
      textContent: publication.textContent,
      blocksContent: publication.blocksContent,
      slug: publication.slug,
      metaTitle: publication.metaTitle,
      metaDescription: publication.metaDescription,
      canonicalUrl: publication.canonicalUrl,
      pinned: publication.pinned,
      discussionEnabled: publication.discussionEnabled,
      licenseTypeId: publication.licenseTypeId,
      featuredImageUrl: publication.featuredImageUrl,
      featuredImageId: publication.featuredImageId,
      topics: publication.topics?.map((t) => ({ id: t.id, name: t.name })) || [],
    };

    const draftData = {
      ...currentDraftData,
      ...data,
    };

    if (
      latestDraft &&
      latestDraft.version !== publication.lastPublishedDraftVersion &&
      now.getTime() - latestDraft.lastUpdateAt.getTime() < intervalMs
    ) {
      // Update current draft version
      await this._prisma.publicationDraft.update({
        where: { id: latestDraft.id },
        data: {
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    } else {
      // Create new draft version
      await this._prisma.publicationDraft.create({
        data: {
          publicationId: publication.id,
          version: (latestDraft?.version ?? 0) + 1,
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    }

    return draftData;
  }

  async saveContent(hash: string, publicationDto: PublicationContentDto) {
    const publication = await this.findDraftByHash(hash);
    const textContent = this.contentBlocksToTextConverter.convert(
      publicationDto.blocksContent as any[],
    );

    const now = new Date();
    const draftData = await this.updateDraftSnapshot(publication, {
      title: publicationDto.title,
      textContent: textContent,
      blocksContent: publicationDto.blocksContent,
    });

    const updatedPublication = await this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        readingTime: readingTime(textContent),
        hasChanges: true,
        version: publication.version + 1,
        updatedAt: now,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        type: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    await this.textQualityQueue.analyzePublication(publication.id);

    return {
      ...updatedPublication,
      title: draftData.title ?? updatedPublication.title,
      textContent: draftData.textContent ?? updatedPublication.textContent,
      blocksContent: draftData.blocksContent ?? updatedPublication.blocksContent,
    };
  }

  async saveSettings(
    hash: string,
    publicationDto: PublicationSettingsDto,
    currentUser: any,
  ) {
    const publication = await this.findDraftByHash(hash);

    // Validate slug uniqueness (global among publications), excluding current draft
    if (publicationDto.slug) {
      await this.assertPublicationSlugUnique(publicationDto.slug, publication.id);
    }

    const topics = publicationDto.topics.map((topicDto) => {
      return {
        id: topicDto.id,
        name: topicDto.name,
      };
    });

    await this.updateDraftSnapshot(publication, {
      slug: publicationDto.slug,
      metaTitle: publicationDto.metaTitle,
      metaDescription: publicationDto.metaDescription,
      canonicalUrl: publicationDto.canonicalUrl,
      pinned: publicationDto.pinned,
      discussionEnabled: publicationDto.discussionEnabled,
      channelId: publicationDto.channelId,
      licenseTypeId: publicationDto.licenseTypeId,
      topics,
      authorId: currentUser.role.type === 'admin' ? publicationDto.authorId : publication.authorId,
    });

    await this.textQualityQueue.analyzePublication(publication.id);

    return this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        updatedAt: new Date(),
        hasChanges: true,
        version: publication.version + 1,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        type: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Ensure that provided publication slug is unique across all publications
   * (excluding the record with excludeId if provided). Throws 400 if taken.
   */
  private async assertPublicationSlugUnique(slug: string, excludeId?: string) {
    if (!slug) return; // other validators handle required/format

    const draft = await this._prisma.publication.findUnique({
      where: { id: excludeId },
      select: { hash: true },
    });

    const exists = await this._prisma.publication.findFirst({
      where: {
        slug,
        AND: [
          ...(excludeId ? [{ NOT: { id: excludeId } }] : []),
          ...(draft?.hash ? [{ NOT: { hash: draft.hash } }] : []),
        ],
      },
      select: { id: true },
    });
    if (exists) {
      throw new BadRequestException('Slug is already taken');
    }
  }

  async schedulePublish(draft: any, scheduledAt: Date) {
    const now = Date.now();
    const delay = scheduledAt.getTime() - now;
    const oneMinute = 60 * 1000;

    if (delay < -oneMinute) {
      throw new BadRequestException(
        'Scheduled date is too far in the past. Please choose a future date.',
      );
    }

    const scheduledStatus =
      await this._prisma.publicationStatus.findUniqueOrThrow({
        where: {
          type: 'scheduled',
        },
      });

    await this._prisma.publication.update({
      where: { id: draft.id },
      data: {
        statusId: scheduledStatus.id,
        scheduledAt,
      },
    });

    await this.publicationQueue.add(
      'publish',
      { hash: draft.hash },
      {
        delay: Math.max(0, delay),
        jobId: `publish-${draft.hash}`,
        removeOnComplete: true,
      },
    );

    return this.findDraftByHash(draft.hash);
  }

  async cancelSchedule(draft: any) {
    if (draft.status.type !== 'scheduled') {
      throw new BadRequestException(
        'Only scheduled publications can have their schedule canceled',
      );
    }
    const statusDraft = await this._prisma.publicationStatus.findUniqueOrThrow({
      where: {
        type: 'draft',
      },
    });

    await this._prisma.publication.update({
      where: { id: draft.id },
      data: {
        statusId: statusDraft.id,
        scheduledAt: null,
      },
    });

    await this.publicationQueue.remove(`publish-${draft.hash}`);

    return this.findDraftByHash(draft.hash);
  }

  async publish(publication: any) {
    const isOldStatusDraft = publication.status.type !== 'published';
    const publishedStatus =
      await this._prisma.publicationStatus.findUniqueOrThrow({
        where: {
          type: 'published',
        },
      });

    const oldChannelId = publication.channelId;
    const oldTopicsIds = publication.topics.map((t) => t.id);

    // Get latest draft to sync
    const latestDraft = await this._prisma.publicationDraft.findFirst({
      where: { publicationId: publication.id },
      orderBy: { version: 'desc' },
    });

    // Copy draft content to live fields on publish
    const publishData: any = {
      publishedAt: isOldStatusDraft ? new Date() : publication.publishedAt,
      status: {
        connect: {
          id: publishedStatus.id,
        },
      },
      hasChanges: false,
    };

    if (latestDraft) {
      const draft = latestDraft.draft as any;
      if (draft.title) {
        publishData.title = draft.title;
      }
      if (draft.slug) {
        publishData.slug = draft.slug;
      } else if (draft.title) {
        publishData.slug = slugifyWithHash(draft.title, publication.id.toString());
      }

      if (draft.textContent) {
        publishData.textContent = draft.textContent;
      }
      if (draft.blocksContent) {
        publishData.blocksContent = draft.blocksContent;
      }
      if (draft.metaTitle !== undefined) {
        publishData.metaTitle = draft.metaTitle;
      }
      if (draft.metaDescription !== undefined) {
        publishData.metaDescription = draft.metaDescription;
      }
      if (draft.canonicalUrl !== undefined) {
        publishData.canonicalUrl = draft.canonicalUrl;
      }
      if (draft.pinned !== undefined) {
        publishData.pinned = draft.pinned;
      }
      if (draft.discussionEnabled !== undefined) {
        publishData.discussionEnabled = draft.discussionEnabled;
      }
      if (draft.featuredImageId !== undefined) {
        publishData.featuredImage = draft.featuredImageId ? { connect: { id: draft.featuredImageId } } : { disconnect: true };
      }
      if (draft.featuredImageUrl !== undefined) {
        publishData.featuredImageUrl = draft.featuredImageUrl;
      }
      if (draft.channelId !== undefined) {
        publishData.channel = draft.channelId ? { connect: { id: draft.channelId } } : { disconnect: true };
      }
      if (draft.authorId !== undefined) {
        publishData.author = { connect: { id: draft.authorId } };
      }
      if (draft.licenseTypeId !== undefined) {
        publishData.licenseType = { connect: { id: draft.licenseTypeId } };
      }

      if (draft.topics !== undefined) {
        publishData.topics = {
          set: [],
          connectOrCreate: draft.topics.map((topicDto) => {
            const slug = slugify(topicDto.name);
            return {
              where: {
                id: topicDto.id,
              },
              create: {
                slug,
                name: topicDto.name,
                createdAt: new Date(),
              },
            };
          }),
        };
      }
    }

    publication = await this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        ...publishData,
        lastPublishedDraftVersion: latestDraft?.version ?? publication.lastPublishedDraftVersion,
      },
      include: {
        channel: {
          include: {
            owner: true,
          },
        },
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        type: true,
        licenseType: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    if (isOldStatusDraft) {
      for (const topic of publication.topics) {
        await this._prisma.topic.update({
          where: {
            id: topic.id,
          },
          data: {
            publicationsCount: topic.publicationsCount + 1,
          },
        });
      }

      if (publication.channel) {
        await this._prisma.channel.update({
          where: {
            id: publication.channel.id,
          },
          data: {
            publicationsCount: publication.channel.publicationsCount + 1,
          },
        });
      }

      await this._prisma.user.update({
        where: {
          id: publication.author.id,
        },
        data: {
          publicationsCount: publication.author.publicationsCount + 1,
        },
      });
    } else {
      const newChannelId = publication.channelId;
      const newTopicsIds = publication.topics.map((t) => t.id);

      if (oldChannelId !== newChannelId) {
        if (oldChannelId) {
          await this._prisma.channel.update({
            where: { id: oldChannelId },
            data: { publicationsCount: { decrement: 1 } },
          });
        }
        if (newChannelId) {
          await this._prisma.channel.update({
            where: { id: newChannelId },
            data: { publicationsCount: { increment: 1 } },
          });
        }
      }

      for (const topicId of oldTopicsIds) {
        if (!newTopicsIds.includes(topicId)) {
          await this._prisma.topic.update({
            where: { id: topicId },
            data: { publicationsCount: { decrement: 1 } },
          });
        }
      }
      for (const topicId of newTopicsIds) {
        if (!oldTopicsIds.includes(topicId)) {
          await this._prisma.topic.update({
            where: { id: topicId },
            data: { publicationsCount: { increment: 1 } },
          });
        }
      }
    }

    this.recommendationService
      .generateAndSaveEmbedding(
        publication.id,
        'publication',
        `${publication.title} ${publication.textContent || ''}`,
      )
      .catch((e) =>
        console.error('Failed to generate embedding for publication', e),
      );

    // Ensure feed item exists for this publication
    try {
      await this.feed.onPublished({
        targetType: 'publication',
        targetId: publication.id,
        authorId:
          (publication as any).authorId ?? (publication as any).author?.id,
        ...(isOldStatusDraft ? { createdAt: publication.publishedAt } : {}),
        pinned: publication.pinned,
      });
      // Additionally, sync derived relations (channel/topics) in case they changed during publish
      await this.feed.onUpdated({
        targetType: 'publication',
        targetId: publication.id,
      });
    } catch {
      // Non-fatal
    }

    await this.textQualityQueue.analyzePublication(publication.id);

    return publication;
  }

  async addFeaturedImage(
    publication: any,
    image: Express.Multer.File,
    uploadedBy: User,
  ) {
    const featuredImage = await this._featureImageService.create(
      image,
      uploadedBy,
    );

    await this.updateDraftSnapshot(publication, {
      featuredImageUrl: featuredImage.url,
      featuredImageId: featuredImage.id,
    });

    await this.textQualityQueue.analyzePublication(publication.id);

    return this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        updatedAt: new Date(),
        version: publication.version + 1,
        hasChanges: true,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        licenseType: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async addImage(
    publication: any,
    image: Express.Multer.File,
    uploadedBy: User,
  ) {
    const file = await this._fileStorage.save(image, uploadedBy);
    publication = await this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        updatedAt: new Date(),
        version: publication.version + 1,
        hasChanges: true,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
      },
    });

    await this.textQualityQueue.analyzePublication(publication.id);

    return {
      file,
      publication,
    };
  }

  async deleteFeaturedImage(publication: any) {
    await this.updateDraftSnapshot(publication, {
      featuredImageUrl: null,
      featuredImageId: null,
    });

    await this.textQualityQueue.analyzePublication(publication.id);

    return this._prisma.publication.update({
      where: {
        id: publication.id,
      },
      data: {
        updatedAt: new Date(),
        version: publication.version + 1,
        hasChanges: true,
      },
      include: {
        channel: true,
        featuredImage: true,
        status: true,
        author: true,
        topics: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async findDrafts(owner: any, customWhere = {}) {
    return this._prisma.publication.findMany({
      where: {
        channel: {
          owner: {
            id: owner.id,
          },
        },
        ...customWhere,
      },
      include: {
        channel: true,
        status: true,
        topics: true,
      },
      orderBy: [
        {
          createdAt: 'desc',
        },
        {
          publishedAt: 'desc',
        },
      ],
    });
  }

  async findAllDraftsCount(owner: any, customWhere = {}): Promise<number> {
    return this._prisma.publication.count({
      where: {
        channel: {
          owner: {
            id: owner.id,
          },
        },
        ...customWhere,
      },
    });
  }

  async findDraftsByStatusType(
    owner: any,
    statusType: string,
  ): Promise<Publication[]> {
    return this.findDrafts(owner, {
      status: {
        type: statusType,
      },
    });
  }

  async readNextOfPublication(publication: any) {
    const where = {};

    if (publication.channelId) {
      where['channelId'] = publication.channelId;
    }

    if (publication.topics.length > 0) {
      where['topics'] = {
        every: {
          id: {
            in: publication.topics.map((topic: any) => topic.id),
          },
        },
      };
    }

    return this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
        id: {
          not: publication.id,
        },
        publishedAt: {
          gte: publication.publishedAt,
        },
        ...where,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 3,
    });
  }
}
