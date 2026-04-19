import {
  Controller,
  Get,
  Query,
  UseGuards,
  Req,
  ParseIntPipe,
  DefaultValuePipe,
  Patch,
  Param,
  HttpCode,
  HttpStatus,
  Delete,
} from '@nestjs/common';
import { Notification as NotificationModel } from '@prisma/client';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { NotificationsManagerService } from '@/notifications/application/services/notifications.manager.service';

const User = () => Req();

interface AuthenticatedRequest extends Request {
  user: { id: string };
}

@UseGuards(AuthGuard)
@Controller('studio/notifications')
export class StudioNotificationsController {
  constructor(
    private readonly notificationsManager: NotificationsManagerService,
  ) {}

  @Get()
  async getNotifications(
    @User() req: AuthenticatedRequest,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('unreadOnly', new DefaultValuePipe('false')) unreadOnly: string,
  ): Promise<{
    notifications: NotificationModel[];
    totalNotificationsCount: number;
    unreadNotificationsCount: number;
    pagesCount: number;
  }> {
    const userId = (req as any).user.id;
    return this.notificationsManager.getNotifications(userId, {
      limit,
      offset,
      unreadOnly: unreadOnly === 'true',
    });
  }

  @Get('unread-count')
  async getUnreadCount(
    @User() req: AuthenticatedRequest,
  ): Promise<{ count: number }> {
    const userId = (req as any).user.id;
    const count = await this.notificationsManager.getUnreadCount(userId);
    return { count };
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  async markAsRead(
    @User() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<NotificationModel> {
    const userId = (req as any).user.id;
    return this.notificationsManager.markAsRead(notificationId, userId);
  }

  @Patch('read-all')
  async markAllAsRead(
    @User() req: AuthenticatedRequest,
  ): Promise<{ count: number }> {
    const userId = (req as any).user.id;
    return this.notificationsManager.markAllAsRead(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteNotification(
    @User() req: AuthenticatedRequest,
    @Param('id') notificationId: string,
  ): Promise<void> {
    const userId = (req as any).user.id;
    await this.notificationsManager.deleteNotification(notificationId, userId);
  }
}
