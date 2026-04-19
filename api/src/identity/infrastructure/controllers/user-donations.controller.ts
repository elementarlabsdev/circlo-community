import { Controller, Get, Param } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Controller()
export class UserDonationsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('users/:username/donations')
  async list(@Param('username') username: string) {
    const user = await this.prisma.user.findUnique({
      where: { username },
      select: { id: true },
    });
    if (!user) return [];
    return this.prisma.donationLink.findMany({
      where: { userId: user.id },
      orderBy: { position: 'asc' },
      select: {
        id: true,
        title: true,
        url: true,
        platform: true,
        position: true,
      },
    });
  }
}
