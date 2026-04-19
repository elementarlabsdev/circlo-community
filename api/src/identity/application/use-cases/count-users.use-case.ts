import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class CountUsersUseCase {
  constructor(private readonly prisma: PrismaService) {}

  execute() {
    return this.prisma.user.count();
  }
}
