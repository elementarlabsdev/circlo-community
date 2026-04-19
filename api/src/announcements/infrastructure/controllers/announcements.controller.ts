import { Controller, Get, Param, Post, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { GetCurrentAnnouncementUseCase } from '../../application/use-cases/get-current-announcement.use-case';
import { DismissAnnouncementUseCase } from '../../application/use-cases/dismiss-announcement.use-case';
import { MarkAnnouncementAsReadUseCase } from '../../application/use-cases/mark-announcement-as-read.use-case';

@Controller('announcements')
export class AnnouncementsController {
  constructor(
    private readonly getCurrentAnnouncementUseCase: GetCurrentAnnouncementUseCase,
    private readonly dismissAnnouncementUseCase: DismissAnnouncementUseCase,
    private readonly markAnnouncementAsReadUseCase: MarkAnnouncementAsReadUseCase,
  ) {}

  @Get('current')
  @UseGuards(AuthGuard)
  async getCurrent(@Req() req: any) {
    return this.getCurrentAnnouncementUseCase.execute(req.user.id);
  }

  @Post(':id/dismiss')
  @UseGuards(AuthGuard)
  async dismiss(@Param('id') id: string, @Req() req: any) {
    return this.dismissAnnouncementUseCase.execute(id, req.user.id);
  }

  @Post(':id/read')
  @UseGuards(AuthGuard)
  async markAsRead(@Param('id') id: string, @Req() req: any) {
    return this.markAnnouncementAsReadUseCase.execute(id, req.user.id);
  }
}
