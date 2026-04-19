import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { NotificationsRepositoryInterface } from '@/notifications/domain/respositories/notifications-repository.interface';

@Injectable()
export class NotificationsRepository
  implements NotificationsRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}
}
