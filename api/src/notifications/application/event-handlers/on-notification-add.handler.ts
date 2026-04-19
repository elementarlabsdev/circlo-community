import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { NotificationAddEvent } from '@/notifications/domain/events/notification-add.event';
import { CreateNotificationUseCase } from '@/notifications/application/use-cases/create-notification.use-case';

@EventsHandler(NotificationAddEvent)
export class OnNotificationAddHandler
  implements IEventHandler<NotificationAddEvent>
{
  constructor(
    private readonly createNotificationUseCase: CreateNotificationUseCase,
  ) {}

  async handle(event: NotificationAddEvent) {
    // // Не отправляем уведомление, если пользователь комментирует свой пост
    // if (event.commentAuthorId === event.publicationAuthorId) return;
    //
    // // Вызываем Use Case нашего контекста для создания уведомления
    // await this.createNotification.execute({
    //   userId: event.publicationAuthorId,
    //   type: 'NEW_COMMENT',
    //   data: { commentAuthorId: event.commentAuthorId },
    //   relatedEntityId: event.commentId,
    // });
  }
}
