import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class IsEmailTakenUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(email: string): Promise<boolean> {
    const count = await this.prisma.user.count({ where: { email } });
    return count > 0;
  }
}
