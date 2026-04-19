import { DashboardWidgetDef } from '@/platform/domain/entities/dashboard-widget-def.entity';

export const DASHBOARD_WIDGET_DEF_REPOSITORY = 'DashboardWidgetDefRepository';

export interface DashboardWidgetDefRepositoryInterface {
  findById(id: string): Promise<DashboardWidgetDef | null>;
  findByType(type: string): Promise<DashboardWidgetDef | null>;
  findAll(): Promise<DashboardWidgetDef[]>;
  create(widget: Partial<Omit<DashboardWidgetDef, 'id'>> & { type: string; name: string }): Promise<DashboardWidgetDef>;
  save(widget: DashboardWidgetDef): Promise<void>;
}
