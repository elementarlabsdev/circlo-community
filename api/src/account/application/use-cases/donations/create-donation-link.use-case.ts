import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Request } from '@/common/domain/interfaces/interfaces';
import { CreateDonationLinkDto } from '@/account/application/dtos/donation-link.dto';

@Injectable()
export class CreateDonationLinkUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(request: Request, dto: CreateDonationLinkDto) {
    const userId = request.user.id;
    const max = await this.prisma.donationLink.aggregate({
      where: { userId },
      _max: { position: true },
    });
    const nextPos = (max._max.position ?? -1) + 1;
    return this.prisma.donationLink.create({
      data: {
        userId,
        title: dto.title,
        url: dto.url,
        platform: dto.platform,
        position: nextPos,
      },
    });
  }
}
