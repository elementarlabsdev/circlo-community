import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class SubscriptionCronService {
  private readonly logger = new Logger(SubscriptionCronService.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkExpiredSubscriptions() {
    this.logger.log('Checking for expired subscriptions...');

    const now = new Date();

    const expiredUsers = await this.prisma.user.updateMany({
      where: {
        hasPaidAccount: true,
        subscriptionExpiresAt: {
          lt: now,
        },
      },
      data: {
        hasPaidAccount: false,
      },
    });

    if (expiredUsers.count > 0) {
      this.logger.log(`Deactivated ${expiredUsers.count} expired subscriptions.`);
    }
  }
}
