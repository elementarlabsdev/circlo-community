import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Announcement } from '../../domain/entities/announcement.entity';
import { AnnouncementRepository } from '../../domain/repositories/announcement-repository.interface';

@Injectable()
export class PrismaAnnouncementRepository implements AnnouncementRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findActive(userId?: string, ip?: string): Promise<Announcement | null> {
    const now = new Date();

    const announcement = await this.prisma.announcement.findFirst({
      where: {
        status: {
          type: 'published',
        },
        startAt: {
          lte: now,
        },
        OR: [
          { endAt: null },
          { endAt: { gt: now } },
        ],
        dismissedBy: {
          none: {
            OR: [
              ...(userId ? [{ userId }] : []),
              ...(ip ? [{ ip }] : []),
            ],
          },
        },
        readBy: {
          none: {
            OR: [
              ...(userId ? [{ userId }] : []),
              ...(ip ? [{ ip }] : []),
            ],
          },
        },
      },
      include: {
        type: true,
      },
      orderBy: [
        { priority: 'desc' },
        { startAt: 'desc' },
      ],
    });

    if (!announcement) {
      return null;
    }

    return Announcement.reconstitute({
      id: announcement.id,
      name: announcement.name,
      content: announcement.content,
      typeId: announcement.typeId,
      type: announcement.type.type,
      priority: announcement.priority,
      dismissable: announcement.dismissable,
      requireManualDismiss: announcement.requireManualDismiss,
      targetUrl: announcement.targetUrl || undefined,
      actionText: announcement.actionText || undefined,
      startAt: announcement.startAt,
      endAt: announcement.endAt || undefined,
      statusId: announcement.statusId,
      createdById: announcement.createdById,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt || undefined,
    });
  }

  async findById(id: string): Promise<Announcement | null> {
    const announcement = await this.prisma.announcement.findUnique({
      where: { id },
      include: {
        type: true,
      },
    });

    if (!announcement) {
      return null;
    }

    return Announcement.reconstitute({
      id: announcement.id,
      name: announcement.name,
      content: announcement.content,
      typeId: announcement.typeId,
      type: announcement.type.type,
      priority: announcement.priority,
      dismissable: announcement.dismissable,
      requireManualDismiss: announcement.requireManualDismiss,
      targetUrl: announcement.targetUrl || undefined,
      actionText: announcement.actionText || undefined,
      startAt: announcement.startAt,
      endAt: announcement.endAt || undefined,
      statusId: announcement.statusId,
      createdById: announcement.createdById,
      createdAt: announcement.createdAt,
      updatedAt: announcement.updatedAt || undefined,
    });
  }

  async dismiss(announcementId: string, userId?: string, ip?: string): Promise<void> {
    await this.prisma.announcementDismissal.upsert({
      where: userId
        ? { announcementId_userId: { announcementId, userId } }
        : { announcementId_ip: { announcementId, ip } },
      create: {
        announcementId,
        userId,
        ip,
      },
      update: {},
    });
  }

  async markAsRead(announcementId: string, userId?: string, ip?: string): Promise<void> {
    await this.prisma.announcementRead.upsert({
      where: userId
        ? { announcementId_userId: { announcementId, userId } }
        : { announcementId_ip: { announcementId, ip } },
      create: {
        announcementId,
        userId,
        ip,
      },
      update: {},
    });
  }
}
