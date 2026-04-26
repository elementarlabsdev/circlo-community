import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class ListStudioMediaUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, mediaView: any) {
    const files = await this.prisma.mediaItem.findMany({
      where: {
        uploadedBy: {
          id: userId,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return {
      files,
      mediaView,
    };
  }
}
