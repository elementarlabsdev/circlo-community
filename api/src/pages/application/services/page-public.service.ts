import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class PagePublicService {
  constructor(private readonly prisma: PrismaService) {}

  async findOneBySlug(slug: string) {
    return this.prisma.page.findFirstOrThrow({
      where: {
        slug,
        status: { type: 'published' },
      },
      include: { author: true },
    });
  }
}
