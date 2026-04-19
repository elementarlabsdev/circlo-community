import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ActivityService } from '@/platform/application/services/activity.service';
import { SettingsService } from '@/settings/application/services/settings.service';
import {
  USER_DASHBOARD_REPOSITORY,
  UserDashboardRepositoryInterface,
} from '@/dashboard/domain/repositories/user-dashboard.repository.interface';

@Injectable()
export class DashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
    private readonly userDashboardRepo: UserDashboardRepositoryInterface,
    private readonly settings: SettingsService,
  ) {}

  async getPublicationsStats(userId: string) {
    const [publishedPublicationsCount, draftPublicationsCount] =
      await this.prisma.$transaction([
        this.prisma.publication.count({
          where: {
            status: { type: 'published' },
            authorId: userId,
          },
        }),
        this.prisma.publication.count({
          where: {
            status: { type: 'draft' },
            authorId: userId,
          },
        }),
      ]);
    return { publishedPublicationsCount, draftPublicationsCount };
  }

  async getFollowersCount(user: { followersCount?: number }) {
    return { followersCount: user.followersCount ?? 0 };
  }

  async getReactionsSum(userId: string) {
    const aggregations = await this.prisma.publication.aggregate({
      _sum: { reactionsCount: true },
      where: {
        status: { type: 'published' },
        authorId: userId,
      },
    });
    return { reactionsCount: aggregations._sum.reactionsCount ?? 0 };
  }

  async getViewsSum(userId: string) {
    const aggregations = await this.prisma.publication.aggregate({
      _sum: { viewsCount: true },
      where: {
        status: { type: 'published' },
        authorId: userId,
      },
    });
    return { viewsCount: aggregations._sum.viewsCount ?? 0 };
  }

  async getUserActivity(userId: string) {
    const activity = await this.activityService.getActivitiesForUser(userId);
    return { activity };
  }

  async getLatestPublishedPublications(userId: string) {
    const publications = await this.prisma.publication.findMany({
      where: {
        authorId: userId,
        status: { type: 'published' },
      },
      orderBy: { publishedAt: 'desc' },
      take: 10,
    });
    return { publications };
  }

  async getLatestDraftPublications(userId: string) {
    const publications = await this.prisma.publication.findMany({
      where: { authorId: userId, status: { type: 'draft' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    return { publications };
  }

  async getLatestPublications(userId: string) {
    // Return a single flat list of publications (draft + published)
    const publications = await this.prisma.publication.findMany({
      where: {
        authorId: userId,
        status: { type: { in: ['draft', 'published'] } },
      },
      // Unified ordering by latest update time
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: {
        status: true,
      },
    });
    return { publications };
  }

  /**
   * Returns a flat list of latest tutorials for the user across statuses
   * draft, unpublishedChanges, and published. Sorted by updatedAt desc.
   */
  async getLatestTutorials(userId: string) {
    const tutorials = await this.prisma.tutorial.findMany({
      where: {
        authorId: userId,
        status: {
          type: { in: ['draft', 'unpublishedChanges', 'published'] },
        },
      },
      include: { status: true },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return { tutorials };
  }

  async getLayout(userId: string, isAdmin = false) {
    const ud = await this.userDashboardRepo.findByUserId(userId);
    let layout = ud?.layout ?? [];

    if (isAdmin) {
      return { layout };
    }

    const contentAllowPublications = await this.settings.findValueByName('contentAllowPublications', true);
    const contentAllowTutorials = await this.settings.findValueByName('contentAllowTutorials', true);

    if (!contentAllowPublications) {
      layout = layout.filter((item: any) =>
        !['publications', 'latestPublications', 'views', 'reactions'].includes(item.type),
      );
    }

    if (!contentAllowTutorials) {
      layout = layout.filter((item: any) => item.type !== 'latestTutorials');
    }

    return { layout };
  }

  async saveLayout(userId: string, layout: any[]) {
    await this.userDashboardRepo.upsert(userId, layout);
    return { success: true };
  }
}

export const DASHBOARD_SERVICE_PROVIDERS = [
  {
    provide: DashboardService,
    useFactory: (
      prisma: PrismaService,
      activityService: ActivityService,
      userDashboardRepo: any,
      settings: SettingsService,
    ) => new DashboardService(prisma, activityService, userDashboardRepo, settings),
    inject: [PrismaService, ActivityService, USER_DASHBOARD_REPOSITORY, SettingsService],
  },
];
