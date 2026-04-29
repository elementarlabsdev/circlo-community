import { Injectable, Logger } from '@nestjs/common';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { NotificationType } from '@/notifications/domain/model/notification.model';

@Injectable()
export class ComplaintNotificationService {
  private readonly logger = new Logger(ComplaintNotificationService.name);

  constructor(
    private readonly notificationsManager: NotificationsManagerService,
    private readonly prisma: PrismaService,
  ) {}

  async notifyComplaintCreated(payload: { complaintId: string }) {
    this.logger.log(`Complaint created: ${payload.complaintId}`);

    try {
      const complaint = await this.prisma.complaint.findUnique({
        where: { id: payload.complaintId },
        include: {
          reporter: true,
          reason: true,
        },
      });

      if (!complaint) {
        this.logger.warn(`Complaint not found: ${payload.complaintId}`);
        return;
      }

      // Находим всех администраторов
      const admins = await this.prisma.user.findMany({
        where: {
          OR: [
            {
              role: {
                type: {
                  in: ['admin', 'super-admin'],
                },
              },
            },
            {
              isSuperAdmin: true,
            },
          ],
        },
      });

      const actor = complaint.reporter
        ? {
            id: complaint.reporter.id,
            name: complaint.reporter.name,
            username: complaint.reporter.username,
            avatarUrl: complaint.reporter.avatarUrl,
          }
        : undefined;

      // Пытаемся получить имя контента, на который подана жалоба
      let targetName = `${complaint.targetType}: ${complaint.targetId}`;
      try {
        if (complaint.targetType === 'publication') {
          const pub = await this.prisma.publication.findUnique({
            where: { id: complaint.targetId },
            select: { title: true },
          });
          if (pub) targetName = pub.title;
        } else if (complaint.targetType === 'comment') {
          const comment = await this.prisma.comment.findUnique({
            where: { id: complaint.targetId },
            select: { textContent: true },
          });
          if (comment)
            targetName =
              comment.textContent.substring(0, 30) +
              (comment.textContent.length > 30 ? '...' : '');
        } else if (complaint.targetType === 'user') {
          const user = await this.prisma.user.findUnique({
            where: { id: complaint.targetId },
            select: { name: true, username: true },
          });
          if (user) targetName = user.name || user.username;
        } else if (complaint.targetType === 'thread') {
          const thread = await this.prisma.thread.findUnique({
            where: { id: complaint.targetId },
            select: { textContent: true },
          });
          if (thread)
            targetName =
              thread.textContent.substring(0, 30) +
              (thread.textContent.length > 30 ? '...' : '');
        }
      } catch (e) {
        this.logger.error(`Failed to fetch target name: ${e.message}`);
      }

      for (const admin of admins) {
        await this.notificationsManager.createOrUpdateNotification({
          userId: admin.id,
          type: NotificationType.NEW_COMPLAINT,
          actor,
          entity: {
            id: complaint.id,
            type: 'complaint',
            name: targetName,
          },
          additionalData: {
            complaintReason: complaint.reason.name,
            complaintDetails: complaint.details,
            targetType: complaint.targetType,
            targetId: complaint.targetId,
          },
        });
      }
    } catch (error) {
      this.logger.error(
        `Failed to send complaint notifications: ${error.message}`,
        error.stack,
      );
    }
  }
}
