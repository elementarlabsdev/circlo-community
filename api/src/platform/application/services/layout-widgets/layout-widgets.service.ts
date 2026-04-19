import { Injectable } from '@nestjs/common';
import {
  RecommendedTopicsWidgetService,
  StaffPicsWidgetService,
  RecommendedChannelsWidgetService,
  SocialMediaLinksWidgetService,
  CommunityInfoWidgetService,
  DiscussionsWidgetService,
  EventsWidgetService,
} from './index';
import { User } from '@prisma/client';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class LayoutWidgetsService {
  private _map = new Map();

  constructor(
    private _recommendedChannelsWidgetService: RecommendedChannelsWidgetService,
    private _recommendedTopicsWidgetService: RecommendedTopicsWidgetService,
    private _staffPicsWidgetService: StaffPicsWidgetService,
    private _socialMediaLinksWidgetService: SocialMediaLinksWidgetService,
    private _communityInfoWidgetService: CommunityInfoWidgetService,
    private _discussionsWidgetService: DiscussionsWidgetService,
    private _eventsWidgetService: EventsWidgetService,
    private _prisma: PrismaService,
  ) {
    this._map.set(
      'recommendedChannels',
      this._recommendedChannelsWidgetService,
    );
    this._map.set('recommendedTopics', this._recommendedTopicsWidgetService);
    this._map.set('staffPics', this._staffPicsWidgetService);
    this._map.set('socialMediaLinks', this._socialMediaLinksWidgetService);
    this._map.set('communityInfo', this._communityInfoWidgetService);
    this._map.set('discussions', this._discussionsWidgetService);
    this._map.set('events', this._eventsWidgetService);
  }

  async findAllLayoutWidgetsBySlotType(slotType: string, user: User) {
    const layoutWidgets = await this._prisma.layoutWidget.findMany({
      where: {
        layoutSlot: {
          type: slotType,
        },
      },
      orderBy: {
        position: 'asc',
      },
    });

    const result = [];

    for (const widget of layoutWidgets) {
      result.push({
        ...widget,
        data: await this.resolve(widget.type).getData(widget, user),
      });
    }

    return result;
  }

  async findAll() {
    return this._prisma.layoutWidgetDef.findMany({
      orderBy: {
        position: 'asc',
      },
    });
  }

  resolve(widgetType: string): any {
    return this._map.get(widgetType);
  }
}
