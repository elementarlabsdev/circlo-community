import { Announcement } from '../entities/announcement.entity';

export interface AnnouncementRepository {
  findActive(userId?: string, ip?: string): Promise<Announcement | null>;
  dismiss(announcementId: string, userId?: string, ip?: string): Promise<void>;
  markAsRead(announcementId: string, userId?: string, ip?: string): Promise<void>;
  findById(id: string): Promise<Announcement | null>;
}

export const ANNOUNCEMENT_REPOSITORY = 'ANNOUNCEMENT_REPOSITORY';
