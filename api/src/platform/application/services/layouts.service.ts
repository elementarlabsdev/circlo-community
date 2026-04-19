import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { LayoutListService } from '@/platform/application/services/layout-list.service';

@Injectable()
export class LayoutsService {
  constructor(
    private readonly prisma: PrismaService,
    // Reuse existing listing logic to minimize changes
    private readonly layoutList: LayoutListService,
  ) {}

  async getListPayload(
    pageSize: number,
    pageNumber: number,
    search = '',
    sortState: any = null,
  ) {
    return this.layoutList.getPayload(pageSize, pageNumber, search, sortState);
  }

  async getEditPayload(id: string) {
    const widgets = await this.prisma.layoutWidgetDef.findMany({
      orderBy: { name: 'asc' },
    });
    const layout = await this.layoutList.getLayoutById(id);
    return { widgets, layout };
  }

  async saveLayoutWidgets(layoutSlotId: string, widgets: any[]) {
    await this.prisma.layoutWidget.deleteMany({ where: { layoutSlotId } });

    if (widgets?.length) {
      await this.prisma.layoutWidget.createMany({
        data: widgets.map((w: any) => ({ ...w, layoutSlotId })),
      });
    }

    return {};
  }
}
