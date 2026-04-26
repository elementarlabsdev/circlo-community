import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MediaViewDto } from '@/media/application/dtos/media-view.dto';

@Injectable()
export class SaveMediaViewUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, dto: MediaViewDto) {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        mediaView: dto.mediaView,
      },
    });
    return {};
  }
}
