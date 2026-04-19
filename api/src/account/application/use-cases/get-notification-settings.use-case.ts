import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class GetNotificationSettingsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string) {
    return this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
  }
}
