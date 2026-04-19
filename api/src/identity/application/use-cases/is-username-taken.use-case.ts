import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class IsUsernameTakenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(username: string, excludeUserId?: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: {
        username,
        id: excludeUserId ? { notIn: [excludeUserId] } : undefined,
      },
    } as any);
    return count > 0;
  }
}
