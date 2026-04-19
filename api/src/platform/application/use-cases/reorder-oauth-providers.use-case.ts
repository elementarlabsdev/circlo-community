import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class ReorderOAuthProvidersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(items: { id: string; position: number }[]): Promise<number> {
    if (!Array.isArray(items) || !items.length) return 0;
    await this.prisma.$transaction(
      items.map((it) =>
        this.prisma.oAuthProvider.update({ where: { id: it.id }, data: { position: it.position } }),
      ),
    );
    return items.length;
  }
}
