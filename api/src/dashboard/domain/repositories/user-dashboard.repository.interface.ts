import { UserDashboard } from '@/dashboard/domain/entities/user-dashboard.entity';

export const USER_DASHBOARD_REPOSITORY = 'UserDashboardRepository';

export interface UserDashboardRepositoryInterface {
  findByUserId(userId: string): Promise<UserDashboard | null>;
  upsertDefault(userId: string, defaultLayout: any[]): Promise<void>;
  upsert(userId: string, layout: any[]): Promise<void>;
  save(entity: UserDashboard): Promise<void>;
}
