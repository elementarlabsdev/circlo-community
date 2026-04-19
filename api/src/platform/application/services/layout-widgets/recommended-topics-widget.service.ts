import { Injectable } from '@nestjs/common';
import { User, LayoutWidgetDef } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class RecommendedTopicsWidgetService {
  constructor(private _prima: PrismaService) {}

  async getData(widget: LayoutWidgetDef, user: User) {
    return this._prima.topic.findMany({
      skip: 0,
      take: widget.settings['limit'],
    });
  }
}
