import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { isDeactivated: true },
    });
  }
}
