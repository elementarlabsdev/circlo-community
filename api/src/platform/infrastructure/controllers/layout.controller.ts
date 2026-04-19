import { Controller, Get, Param, Req } from '@nestjs/common';
import { LayoutPublicService } from '@/platform/application/services/layout-public.service';

@Controller('layout')
export class LayoutController {
  constructor(private readonly layout: LayoutPublicService) {}

  @Get('slot/:slotType/widgets')
  async index(@Req() req: any, @Param('slotType') slotType: string) {
    return this.layout.getWidgetsForSlot(slotType, req.user);
  }
}
