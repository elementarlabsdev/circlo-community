import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { LayoutWidgetDef } from '@/platform/domain/entities/layout-widget-def.entity';
import { LayoutWidgetDefRepositoryInterface } from '@/platform/domain/repositories/layout-widget-def.repository.interface';

@Injectable()
export class LayoutWidgetDefRepository implements LayoutWidgetDefRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<LayoutWidgetDef | null> {
    const db = await this.prisma.layoutWidgetDef.findUnique({ where: { id } });
    return db ? LayoutWidgetDef.reconstitute(db as any) : null;
    }

  async findByType(type: string): Promise<LayoutWidgetDef | null> {
    const db = await this.prisma.layoutWidgetDef.findUnique({ where: { type } });
    return db ? LayoutWidgetDef.reconstitute(db as any) : null;
  }

  async findAll(): Promise<LayoutWidgetDef[]> {
    const rows = await this.prisma.layoutWidgetDef.findMany({ orderBy: { position: 'asc' } });
    return rows.map((r) => LayoutWidgetDef.reconstitute(r as any));
  }

  async create(widget: any): Promise<LayoutWidgetDef> {
    const count = await this.prisma.layoutWidgetDef.count();
    const data = {
      name: widget.name,
      description: widget.description ?? null,
      type: widget.type,
      settings: widget.settings ?? {},
      position: widget.position ?? count + 1,
    } as any;
    const created = await this.prisma.layoutWidgetDef.create({ data });
    return LayoutWidgetDef.reconstitute(created as any);
  }

  async save(widget: LayoutWidgetDef): Promise<void> {
    const data = widget.toPrimitives();
    await this.prisma.layoutWidgetDef.update({
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
