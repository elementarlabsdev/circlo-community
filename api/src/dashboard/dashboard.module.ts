import { Global, Module } from '@nestjs/common';
import { UserDashboardRepository } from '@/dashboard/infrastructure/persistence/user-dashboard.repository';
import { USER_DASHBOARD_REPOSITORY } from '@/dashboard/domain/repositories/user-dashboard.repository.interface';
import { StudioDashboardController } from '@/dashboard/infrastructure/controllers/studio-dashboard.controller';
import { DASHBOARD_SERVICE_PROVIDERS } from '@/dashboard/application/services/dashboard.service';
import { AdminDashboardController } from '@/dashboard/infrastructure/controllers/admin-dashboard.controller';
import { AdminDashboardService } from '@/dashboard/application/services/admin-dashboard.service';

@Global()
@Module({
  imports: [],
  controllers: [StudioDashboardController, AdminDashboardController],
  providers: [
    // repositories
    UserDashboardRepository,
    {
      provide: USER_DASHBOARD_REPOSITORY,
      useClass: UserDashboardRepository,
    },
    AdminDashboardService,
    ...DASHBOARD_SERVICE_PROVIDERS,
  ],
  exports: [USER_DASHBOARD_REPOSITORY],
})
export class DashboardModule {}
