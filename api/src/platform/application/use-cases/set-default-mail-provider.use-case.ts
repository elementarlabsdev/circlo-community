import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class SetDefaultMailProviderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(type: string): Promise<void> {
    await this.prisma.mailProvider.updateMany({ data: { isDefault: false } });
    await this.prisma.mailProvider.update({ where: { type }, data: { isDefault: true } });
  }
}
