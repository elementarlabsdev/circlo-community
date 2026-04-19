import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class EmailVerificationCleanupCron {
  private readonly logger = new Logger(EmailVerificationCleanupCron.name);

  constructor(private readonly prisma: PrismaService) {}

  @Cron(CronExpression.EVERY_HOUR)
  public async handleCleanup(): Promise<void> {
    const now = new Date();
    const result = await this.prisma.emailVerification.deleteMany({
      where: {
        expireAt: { lt: now },
      },
    });
    if (result.count > 0) {
      this.logger.log(`Deleted ${result.count} expired email verifications`);
    }
  }
}
