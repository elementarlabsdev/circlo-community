import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANNOUNCEMENT_REPOSITORY, AnnouncementRepository } from '../../domain/repositories/announcement-repository.interface';

@Injectable()
export class DismissAnnouncementUseCase {
  constructor(
    @Inject(ANNOUNCEMENT_REPOSITORY)
    private readonly announcementRepository: AnnouncementRepository,
  ) {}

  async execute(announcementId: string, userId: string, ip?: string): Promise<void> {
    const announcement = await this.announcementRepository.findById(announcementId);

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    if (announcement.requireManualDismiss) {
      await this.announcementRepository.markAsRead(announcementId, userId, ip);
    }

    await this.announcementRepository.dismiss(announcementId, userId, ip);
  }
}
