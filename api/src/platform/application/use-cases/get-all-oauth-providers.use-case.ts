import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class GetAllOAuthProvidersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const rows = await this.prisma.oAuthProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return rows;
  }
}
