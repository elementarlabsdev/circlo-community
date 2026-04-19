import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subMonths } from 'date-fns';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class DeleteOldVerificationsTask {
  constructor(private _prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_6AM)
  async handleCron() {
    await this._prismaService.emailVerification.deleteMany({
      where: {
        createdAt: {
          lt: subMonths(new Date(), 1),
        },
      },
    });
    await this._prismaService.passwordReset.deleteMany({
      where: {
        createdAt: {
          lt: subMonths(new Date(), 1),
        },
      },
    });
  }
}
