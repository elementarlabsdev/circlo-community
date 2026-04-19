import { Inject, Injectable } from '@nestjs/common';
import {
  ANNOUNCEMENT_REPOSITORY,
  AnnouncementRepository,
} from '../../domain/repositories/announcement-repository.interface';
import { AnnouncementDto } from '../dtos/announcement.dto';

@Injectable()
export class GetCurrentAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async execute(userId?: string, ip?: string): Promise<AnnouncementDto | null> {
    const announcement = await this.announcementRepository.findActive(
      userId,
      ip,
    );

    if (!announcement) {
      return null;
    }

    if (!announcement.requireManualDismiss) {
      await this.announcementRepository.markAsRead(announcement.id, userId, ip);
    }

    return {
      id: announcement.id,
      content: announcement.content,
      type: announcement.type || 'info',
      dismissable: announcement.dismissable,
      requireManualDismiss: announcement.requireManualDismiss,
      targetUrl: announcement.targetUrl,
      actionText: announcement.actionText,
    };
  }
}
