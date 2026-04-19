import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { DashboardService } from '@/dashboard/application/services/dashboard.service';
import { GetUser } from '@/common/infrastructure/decorators/get-user.decorator';
import { User } from '@prisma/client';
import { FeatureEnabledGuard } from '@/common/infrastructure/guards/feature-enabled.guard';
import { FeatureEnabled } from '@/common/infrastructure/decorators/feature-enabled.decorator';

@Controller('studio/dashboard')
@UseGuards(AuthGuard)
export class StudioDashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('publications')
  @UseGuards(FeatureEnabledGuard)
  @FeatureEnabled('contentAllowPublications')
  async publications(@GetUser() user: User) {
    return this.dashboard.getPublicationsStats(user.id);
  }

  @Get('followers')
  async followers(@GetUser() user: User) {
    return this.dashboard.getFollowersCount(user);
  }

  @Get('reactions')
  @UseGuards(FeatureEnabledGuard)
  @FeatureEnabled('contentAllowPublications')
  async reactions(@GetUser() user: User) {
    return this.dashboard.getReactionsSum(user.id);
  }

  @Get('views')
  @UseGuards(FeatureEnabledGuard)
  @FeatureEnabled('contentAllowPublications')
  async views(@GetUser() user: User) {
    return this.dashboard.getViewsSum(user.id);
  }

  @Get('activity')
  async activity(@GetUser() user: User) {
    return this.dashboard.getUserActivity(user.id);
  }

  @Get('layout')
  async getLayout(@GetUser() user: any) {
    return this.dashboard.getLayout(user.id, user.role?.type === 'admin');
  }

  @Post('layout')
  async saveLayout(@GetUser() user: User, @Body() body: any) {
    const layout = Array.isArray(body?.layout) ? body.layout : [];
    return this.dashboard.saveLayout(user.id, layout);
  }

  // New: last publications (both published and draft)
  @Get('latest-publications')
  @UseGuards(FeatureEnabledGuard)
  @FeatureEnabled('contentAllowPublications')
  async lastPublications(@GetUser() user: User) {
    return this.dashboard.getLatestPublications(user.id);
  }

  // New: last tutorials grouped by status
  @Get('latest-tutorials')
  @UseGuards(FeatureEnabledGuard)
  @FeatureEnabled('contentAllowTutorials')
  async lastTutorials(@GetUser() user: User) {
    return this.dashboard.getLatestTutorials(user.id);
  }
}
