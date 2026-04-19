import { Injectable } from '@nestjs/common';
import { LayoutWidgetDef } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class StaffPicsWidgetService {
  constructor(private _prisma: PrismaService) {}

  async getData(widget: LayoutWidgetDef) {
    return this._prisma.publication.findMany({
      where: {
        status: {
          type: 'published',
        },
      },
      take: widget.settings['limit'],
      skip: 0,
      orderBy: {
        publishedAt: 'desc',
      },
      include: {
        channel: true,
      },
    });
  }
}
