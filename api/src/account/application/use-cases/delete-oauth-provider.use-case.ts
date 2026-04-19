import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class DeleteOAuthProviderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, providerId: string) {
    const provider = await this.prisma.userOAuthLoginProvider.findFirst({
      where: {
        id: providerId,
        userId,
      },
    });

    if (!provider) {
      throw new NotFoundException('OAuth provider not found');
    }

    await this.prisma.userOAuthLoginProvider.delete({
      where: {
        id: providerId,
      },
    });

    return { success: true };
  }
}
