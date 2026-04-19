import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { subMonths } from 'date-fns';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class DeleteNotVerifiedUsersTask {
  constructor(private _prismaService: PrismaService) {}

  @Cron(CronExpression.EVERY_DAY_AT_NOON)
  async handleCron() {
    await this._prismaService.user.deleteMany({
      where: {
        verified: false,
        createdAt: {
          lt: subMonths(new Date(), 1),
        },
      },
    });
  }
}
