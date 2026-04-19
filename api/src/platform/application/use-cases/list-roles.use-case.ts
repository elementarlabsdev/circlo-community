import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    return this.prisma.role.findMany({
      select: { id: true, name: true, type: true },
      orderBy: { name: 'asc' },
    });
  }
}
