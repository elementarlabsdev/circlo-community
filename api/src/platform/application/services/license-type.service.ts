import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class LicenseTypeService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.licenseType.findMany({
      where: { parentId: null },
      orderBy: { position: 'asc' },
      include: { children: true, parent: true },
    });
  }
}
