import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { NotificationSettingsDto } from '@/account/application/dtos/notification-settings.dto';

@Injectable()
export class SaveNotificationSettingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: NotificationSettingsDto): Promise<void> {
    await this.prisma.notificationSettings.update({
      where: { userId },
      data: dto,
    });
  }
}
