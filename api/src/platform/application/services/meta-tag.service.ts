import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class MetaTagService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllGlobal() {
    return this.prisma.metaTag.findMany({
      where: {
        channelId: null,
        pageId: null,
        publicationId: null,
      },
    });
  }

  async saveGlobal(metaTags: any[]) {
    // Delete all global tags and recreate them
    await this.prisma.metaTag.deleteMany({
      where: {
        channelId: null,
        pageId: null,
        publicationId: null,
      },
    });

    if (metaTags.length > 0) {
      await this.prisma.metaTag.createMany({
        data: metaTags.map((tag) => ({
          type: tag.type,
          name: tag.name,
          property: tag.property,
          content: tag.content,
        })),
      });
    }

    return this.findAllGlobal();
  }
}
