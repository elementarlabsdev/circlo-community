import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class SaveColorSchemeUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(userId: string, colorScheme: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { preferredColorScheme: colorScheme },
    });
  }
}
