import { Injectable } from '@nestjs/common';
import { LayoutWidgetsService } from '@/platform/application/services/layout-widgets/layout-widgets.service';

@Injectable()
export class LayoutPublicService {
  constructor(private readonly widgets: LayoutWidgetsService) {}

  async getWidgetsForSlot(slotType: string, user: any) {
    const widgets = await this.widgets.findAllLayoutWidgetsBySlotType(
      slotType,
      user,
    );
    return { widgets };
  }
}
