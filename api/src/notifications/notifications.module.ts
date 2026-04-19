import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StudioNotificationsController } from '@/notifications/infrastructure/controllers/studio/studio-notifications.controller';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';
import { NOTIFICATIONS_REPOSITORY } from '@/notifications/domain/respositories/notifications-repository.interface';
import { NotificationsRepository } from '@/notifications/infrastructure/persistence/notifications.repository';
import { CreateNotificationUseCase } from '@/notifications/application/use-cases/create-notification.use-case';

@Global()
@Module({
  imports: [ConfigModule],
  controllers: [StudioNotificationsController],
  providers: [
    // services
    NotificationsManagerService,
    NotificationsRepository,

    // use cases
    CreateNotificationUseCase,

    // repositories
    {
      provide: NOTIFICATIONS_REPOSITORY,
      useClass: NotificationsRepository,
    },
  ],
  exports: [NotificationsManagerService],
})
export class NotificationsModule {}
