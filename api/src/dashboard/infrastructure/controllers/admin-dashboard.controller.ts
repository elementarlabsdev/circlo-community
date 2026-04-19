import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@/identity/infrastructure/guards/auth.guard';
import { AdminDashboardService } from '@/dashboard/application/services/admin-dashboard.service';
import { AbilitiesGuard } from '@/casl/guards/abilities.guard';
import { CheckAbilities } from '@/casl/decorators/check-abilities.decorator';
import { Action } from '@/common/domain/interfaces/action.enum';

@Controller('admin/dashboard')
@UseGuards(AuthGuard, AbilitiesGuard)
export class AdminDashboardController {
  constructor(private readonly dashboard: AdminDashboardService) {}

  @Get('getting-started')
  @CheckAbilities([Action.Read, 'AdminPanel'])
  async gettingStarted() {
    // Placeholder endpoint: return simple onboarding hints for admins
    return {
      steps: [
        { id: 'check-settings', title: 'Check platform settings' },
        {
          id: 'review-content',
          title: 'Review recent publications and tutorials',
        },
        { id: 'monitor-activity', title: 'Monitor user activity' },
      ],
    };
  }

  @Get('publicationCount')
  async publicationCount() {
    return this.dashboard.getSystemPublicationCount();
  }

  @Get('reactionCount')
  async reactionCount() {
    return this.dashboard.getSystemReactionCount();
  }

  @Get('viewCount')
  async viewCount() {
    return this.dashboard.getSystemViewCount();
  }

  @Get('activity')
  async activity() {
    return this.dashboard.getSystemActivity();
  }

  @Get('layout')
  async getLayout() {
    return this.dashboard.getSystemLayout();
  }

  @Post('layout')
  @CheckAbilities([Action.Manage, 'AdminPanel'])
  async saveLayout(@Body() body: any) {
    const layout = Array.isArray(body?.layout) ? body.layout : [];
    return this.dashboard.saveSystemLayout(layout);
  }

  @Get('latest-publications')
  async lastPublications() {
    return this.dashboard.getLatestPublicationsGlobal();
  }

  @Get('latest-tutorials')
  async lastTutorials() {
    return this.dashboard.getLatestTutorialsGlobal();
  }
}
