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

      for (const admin of admins) {
        await this.notificationsManager.createOrUpdateNotification({
          userId: admin.id,
          type: NotificationType.NEW_COMPLAINT,
          actor,
          entity: {
            id: complaint.id,
            type: 'complaint',
            name: complaint.reason.name,
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
