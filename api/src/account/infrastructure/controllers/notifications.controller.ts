import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { Request } from '@/common/domain/interfaces/interfaces';
import { GetNotificationSettingsUseCase } from '@/account/application/use-cases/get-notification-settings.use-case';
import { SaveNotificationSettingsUseCase } from '@/account/application/use-cases/save-notification-settings.use-case';
import { NotificationSettingsDto } from '@/account/application/dtos/notification-settings.dto';

@Controller('studio/account/notifications')
@UseGuards(AuthGuard)
export class NotificationsController {
  constructor(
    private readonly getNotificationSettings: GetNotificationSettingsUseCase,
    private readonly saveNotificationSettings: SaveNotificationSettingsUseCase,
  ) {}

  @Get()
  async index(@Req() request: Request) {
    const notificationSettings = await this.getNotificationSettings.execute(
      request.user.id,
    );
    return {
      notificationSettings,
    };
  }

  @Post()
  async save(
    @Req() request: Request,
    @Body() notificationSettingsDto: NotificationSettingsDto,
  ) {
    await this.saveNotificationSettings.execute(
      request.user.id,
      notificationSettingsDto,
    );
    return {};
  }
}
