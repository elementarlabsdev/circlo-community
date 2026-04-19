import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ActivityService } from '@/platform/application/services/activity.service';

@Injectable()
export class AdminDashboardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly activityService: ActivityService,
  ) {}

  async getSystemPublicationCount() {
    const [publishedPublicationsCount, draftPublicationsCount] =
      await this.prisma.$transaction([
        this.prisma.publication.count({
          where: {
            status: { type: 'published' },
          },
        }),
        this.prisma.publication.count({
          where: {
            status: { type: 'draft' },
          },
        }),
      ]);
    return { publishedPublicationsCount, draftPublicationsCount };
  }

  async getSystemReactionCount() {
    const aggregations = await this.prisma.publication.aggregate({
      _sum: { reactionsCount: true },
      where: {
        status: { type: 'published' },
      },
    });
    return { reactionsCount: aggregations._sum.reactionsCount ?? 0 };
  }

  async getSystemViewCount() {
    const aggregations = await this.prisma.publication.aggregate({
      _sum: { viewsCount: true },
      where: {
        status: { type: 'published' },
      },
    });
    return { viewsCount: aggregations._sum.viewsCount ?? 0 };
  }

  async getSystemActivity() {
    // Latest 20 activities across the platform
    const activities = await this.activityService.findAll({
      page: 1,
      limit: 20,
    } as any);
    return { activity: activities.data };
  }

  async getSystemLayout() {
    const sd = await this.prisma.systemDashboard.findFirst({
      where: { type: 'default' },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    return { layout: (sd?.layout as any[]) ?? [] };
  }

  async saveSystemLayout(layout: any[]) {
    const existing = await this.prisma.systemDashboard.findFirst({
      where: { type: 'default' },
      orderBy: [{ position: 'asc' }, { createdAt: 'asc' }],
    });
    if (!existing) {
      await this.prisma.systemDashboard.create({
        data: { layout: layout as any, position: 0, type: 'default' },
      });
    } else {
      await this.prisma.systemDashboard.update({
        where: { id: existing.id },
        data: { layout: layout as any },
      });
    }
    return { success: true };
  }

  async getLatestPublicationsGlobal() {
    const publications = await this.prisma.publication.findMany({
      where: {
        status: { type: { in: ['draft', 'published'] } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      include: { status: true, author: { select: { id: true, name: true } } },
    });
    return { publications };
  }

  async getLatestTutorialsGlobal() {
    const tutorials = await this.prisma.tutorial.findMany({
      where: {
        status: { type: { in: ['draft', 'unpublishedChanges', 'published'] } },
      },
      include: { status: true, author: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
      take: 20,
    });
    return { tutorials };
  }
}
