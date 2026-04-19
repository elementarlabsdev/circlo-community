import { LayoutWidgetDef } from '@/platform/domain/entities/layout-widget-def.entity';

export const LAYOUT_WIDGET_DEF_REPOSITORY = 'LayoutWidgetDefRepository';

export interface LayoutWidgetDefRepositoryInterface {
  findById(id: string): Promise<LayoutWidgetDef | null>;
  findByType(type: string): Promise<LayoutWidgetDef | null>;
  findAll(): Promise<LayoutWidgetDef[]>;
  create(widget: Partial<Omit<LayoutWidgetDef, 'id'>> & { type: string; name: string }): Promise<LayoutWidgetDef>;
  save(widget: LayoutWidgetDef): Promise<void>;
}
