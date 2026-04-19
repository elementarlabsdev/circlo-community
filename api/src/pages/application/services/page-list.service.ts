import { BadRequestException, Injectable } from '@nestjs/common';
import { Page, User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { readingTime } from 'reading-time-estimator';
import { FileStorageService } from '@/platform/application/services/file-storage.service';
import { slugifyWithHash } from '@/common/infrastructure/utils/slugify';
import { FeaturedImageService } from '@/common/application/services/featured-image.service';
import { PageContentDto } from '@/pages/application/dtos/page-content.dto';
import { PageSettingsDto } from '@/pages/application/dtos/page-settings.dto';
import { ContentBlocksToTextConverter } from '@/common/application/services/content-blocks-to-text-converter.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import * as crypto from 'crypto';

@Injectable()
export class PageListService {
  constructor(
    private _prisma: PrismaService,
    private _featureImageService: FeaturedImageService,
    private _fileStorage: FileStorageService,
    private contentBlocksToTextConverter: ContentBlocksToTextConverter,
    private settingsService: SettingsService,
  ) {}

  async getCountByStatusType(statusType: string, search = ''): Promise<number> {
    const where = {
      status: {
        type: statusType,
      },
    };

    if (search) {
      where['title'] = {
        contains: search,
        mode: 'insensitive',
      };
    }

    return this._prisma.page.count({
      where: {
        ...where,
      },
    });
  }

  async createDraft(author: User): Promise<Page> {
    const defaultTitle = 'No Title';
    const draftData = {
      title: defaultTitle,
      textContent: '',
      blocksContent: [],
    };
    const newPage = await this._prisma.page.create({
      data: {
        title: defaultTitle,
        hash: crypto.randomUUID(),
        slug: slugifyWithHash(defaultTitle, crypto.randomUUID().toString()),
        textContent: '',
        blocksContent: [],
        status: {
          connect: {
            type: 'draft',
          },
        },
        createdAt: new Date(),
        readingTime: readingTime(''),
        author: {
          connect: {
            id: author.id,
          },
        },
      },
    });

    await this._prisma.pageDraft.create({
      data: {
        pageId: newPage.id,
        version: 1,
        lastUpdateAt: new Date(),
        draft: draftData,
      },
    });

    return newPage;
  }

  async findOneById(id: string): Promise<Page> {
    return this._prisma.page.findUnique({
      where: {
        id,
      },
      include: {
        author: true,
        status: true,
      },
    });
  }

  async findPaginated(
    pageSize: number,
    pageNumber: number,
    statusType: string,
    author: User,
    search = '',
    sortState = null,
  ) {
    const where: any = {
      status: {
        type: statusType,
      },
    };
    let orderBy: any = {
      createdAt: 'desc',
    };

    if (search) {
      where['title'] = {
        contains: search,
        mode: 'insensitive',
      };
    }

    if (sortState) {
      orderBy = sortState;
    }

    const items: Page[] = await this._prisma.page.findMany({
      where,
      orderBy: {
        ...orderBy,
      },
      include: {
        author: true,
        status: true,
      },
      take: pageSize,
      skip: (pageNumber - 1) * pageSize,
    });
    const totalItems = await this._prisma.page.count({
      where,
    });
    const pagination = {
      totalItems,
      totalPages: Math.ceil(totalItems / pageSize),
      pageSize,
      pageNumber,
    };
    return {
      items,
      pagination,
    };
  }

  async bulkDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.delete(id);
    }
  }

  async delete(id: string): Promise<void> {
    const page = await this.findOneById(id);

    if (!page) {
      return;
    }

    const status = await this._prisma.pageStatus.findUniqueOrThrow({
      where: {
        type: 'archived',
      },
    });

    await this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        status: {
          connect: {
            id: status.id,
          },
        },
      },
    });
  }

  async forceDelete(id: string): Promise<void> {
    const page = await this.findOneById(id);

    if (!page) {
      return;
    }

    if (page.featuredImageId) {
      await this._prisma.mediaItem.update({
        where: {
          id: page.featuredImageId,
        },
        data: {
          deleted: true,
        },
      });
    }

    await this._prisma.page.delete({
      where: {
        id: page.id,
      },
    });
  }

  async bulkForceDelete(ids: string[]): Promise<void> {
    for (const id of ids) {
      await this.forceDelete(id);
    }
  }

  async findDraftByHash(hash: string) {
    const page = await this._prisma.page.findFirstOrThrow({
      where: {
        hash,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    const draft = page.drafts?.[0]?.draft as any;
    if (draft) {
      return {
        ...page,
        title: draft.title ?? page.title,
        textContent: draft.textContent ?? page.textContent,
        blocksContent: draft.blocksContent ?? page.blocksContent,
      };
    }

    return page;
  }

  private async updateDraftSnapshot(page: any, data: any) {
    const latestDraft = page.drafts?.[0];
    const draftVersionCreationInterval = await this.settingsService.findValueByName(
      'newDraftVersionCreationInterval',
      5,
    );
    const intervalMs = draftVersionCreationInterval * 60 * 1000;
    const now = new Date();

    const currentDraftData = (latestDraft?.draft as any) || {
      title: page.title,
      textContent: page.textContent,
      blocksContent: page.blocksContent,
      slug: page.slug,
      metaTitle: page.metaTitle,
      metaDescription: page.metaDescription,
      featuredImageUrl: page.featuredImageUrl,
      featuredImageId: page.featuredImageId,
    };

    const draftData = {
      ...currentDraftData,
      ...data,
    };

    if (
      latestDraft &&
      latestDraft.version !== page.lastPublishedDraftVersion &&
      now.getTime() - latestDraft.lastUpdateAt.getTime() < intervalMs
    ) {
      // Update current draft version
      await this._prisma.pageDraft.update({
        where: { id: latestDraft.id },
        data: {
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    } else {
      // Create new draft version
      await this._prisma.pageDraft.create({
        data: {
          pageId: page.id,
          version: (latestDraft?.version ?? 0) + 1,
          lastUpdateAt: now,
          draft: draftData,
        },
      });
    }

    return draftData;
  }

  async saveContent(hash: string, pageDto: PageContentDto) {
    const page = await this.findDraftByHash(hash);
    const textContent = this.contentBlocksToTextConverter.convert(
      pageDto.blocksContent as any[],
    );

    const now = new Date();
    const draftData = await this.updateDraftSnapshot(page, {
      title: pageDto.title,
      textContent: textContent,
      blocksContent: pageDto.blocksContent,
    });

    const updatedPage = await this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        readingTime: readingTime(textContent),
        updatedAt: now,
        hasChanges: true,
        version: page.version + 1,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });

    return {
      ...updatedPage,
      title: draftData.title ?? updatedPage.title,
      textContent: draftData.textContent ?? updatedPage.textContent,
      blocksContent: draftData.blocksContent ?? updatedPage.blocksContent,
    };
  }

  async saveSettings(hash: string, pageSettingsDto: PageSettingsDto) {
    const page = await this.findDraftByHash(hash);

    if (pageSettingsDto.slug) {
      await this.assertPageSlugUnique(pageSettingsDto.slug, page.id);
    }

    await this.updateDraftSnapshot(page, {
      slug: pageSettingsDto.slug,
      metaTitle: pageSettingsDto.metaTitle,
      metaDescription: pageSettingsDto.metaDescription,
    });

    return this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        updatedAt: new Date(),
        hasChanges: true,
        version: page.version + 1,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  /**
   * Ensure that provided page slug is unique across all pages
   * (excluding the record with excludeId if provided). Throws 400 if taken.
   */
  private async assertPageSlugUnique(slug: string, excludeId?: string) {
    if (!slug) return;

    const draft = await this._prisma.page.findUnique({
      where: { id: excludeId },
      select: { hash: true },
    });

    const exists = await this._prisma.page.findFirst({
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

  async publish(page: any) {
    const isOldStatusDraft = page.status.type !== 'published';
    const publishedStatus = await this._prisma.pageStatus.findUniqueOrThrow({
      where: {
        type: 'published',
      },
    });

    // Get latest draft to sync
    const latestDraft = await this._prisma.pageDraft.findFirst({
      where: { pageId: page.id },
      orderBy: { version: 'desc' },
    });

    // Copy draft content to live fields on publish
    const publishData: any = {
      publishedAt: isOldStatusDraft ? new Date() : page.publishedAt,
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
        publishData.slug = slugifyWithHash(draft.title, page.id.toString());
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
      if (draft.featuredImageId !== undefined) {
        publishData.featuredImageId = draft.featuredImageId;
      }
      if (draft.featuredImageUrl !== undefined) {
        publishData.featuredImageUrl = draft.featuredImageUrl;
      }
    }

    return this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        ...publishData,
        lastPublishedDraftVersion: latestDraft?.version ?? page.lastPublishedDraftVersion,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async addFeaturedImage(
    page: any,
    image: Express.Multer.File,
    uploadedBy: User,
  ) {
    const featuredImage = await this._featureImageService.create(
      image,
      uploadedBy,
    );

    await this.updateDraftSnapshot(page, {
      featuredImageUrl: featuredImage.url,
      featuredImageId: featuredImage.id,
    });

    return this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        updatedAt: new Date(),
        version: page.version + 1,
        hasChanges: true,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async addImage(page: any, image: Express.Multer.File, uploadedBy: User) {
    const file = await this._fileStorage.save(image, uploadedBy);
    page = await this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        updatedAt: new Date(),
        version: page.version + 1,
        hasChanges: true,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
      },
    });
    return {
      file,
      page,
    };
  }

  async deleteFeaturedImage(page: any) {
    await this.updateDraftSnapshot(page, {
      featuredImageUrl: null,
      featuredImageId: null,
    });

    return this._prisma.page.update({
      where: {
        id: page.id,
      },
      data: {
        updatedAt: new Date(),
        version: page.version + 1,
        hasChanges: true,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
        drafts: {
          orderBy: { version: 'desc' },
          take: 1,
        },
      },
    });
  }

  async bulkUnpublish(ids: string[]) {
    for (const id of ids) {
      await this.unpublish(id);
    }
  }

  async unpublish(id: string) {
    const status = await this._prisma.pageStatus.findUniqueOrThrow({
      where: {
        type: 'draft',
      },
    });

    return this._prisma.page.update({
      where: {
        id,
      },
      data: {
        statusId: status.id,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
      },
    });
  }

  async restore(id: string) {
    const status = await this._prisma.pageStatus.findUniqueOrThrow({
      where: {
        type: 'draft',
      },
    });

    return this._prisma.page.update({
      where: {
        id,
      },
      data: {
        statusId: status.id,
      },
      include: {
        featuredImage: true,
        status: true,
        author: true,
      },
    });
  }
}
