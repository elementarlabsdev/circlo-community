import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Request } from '@/common/domain/interfaces/interfaces';

@Injectable()
export class ListMyDonationLinksUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(request: Request) {
    const userId = request.user.id;
    return this.prisma.donationLink.findMany({
      where: { userId },
      orderBy: { position: 'asc' },
    });
  }
}
