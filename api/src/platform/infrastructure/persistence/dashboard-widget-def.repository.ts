import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { DashboardWidgetDef } from '@/platform/domain/entities/dashboard-widget-def.entity';
import { DashboardWidgetDefRepositoryInterface } from '@/platform/domain/repositories/dashboard-widget-def.repository.interface';

@Injectable()
export class DashboardWidgetDefRepository implements DashboardWidgetDefRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<DashboardWidgetDef | null> {
    const db = await this.prisma.dashboardWidgetDef.findUnique({ where: { id } });
    return db ? DashboardWidgetDef.reconstitute(db as any) : null;
  }

  async findByType(type: string): Promise<DashboardWidgetDef | null> {
    const db = await this.prisma.dashboardWidgetDef.findUnique({ where: { type } });
    return db ? DashboardWidgetDef.reconstitute(db as any) : null;
  }

  async findAll(): Promise<DashboardWidgetDef[]> {
    const rows = await this.prisma.dashboardWidgetDef.findMany({ orderBy: { position: 'asc' } });
    return rows.map((r) => DashboardWidgetDef.reconstitute(r as any));
  }

  async create(widget: any): Promise<DashboardWidgetDef> {
    const count = await this.prisma.dashboardWidgetDef.count();
    const data = {
      name: widget.name,
      description: widget.description ?? null,
      type: widget.type,
      settings: widget.settings ?? {},
      position: widget.position ?? count + 1,
    } as any;
    const created = await this.prisma.dashboardWidgetDef.create({ data });
    return DashboardWidgetDef.reconstitute(created as any);
  }

  async save(widget: DashboardWidgetDef): Promise<void> {
    const data = widget.toPrimitives();
    await this.prisma.dashboardWidgetDef.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        settings: data.settings,
        position: data.position,
      },
    });
  }
}
