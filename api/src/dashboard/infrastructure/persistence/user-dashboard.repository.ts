import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { UserDashboard } from '@/dashboard/domain/entities/user-dashboard.entity';
import { UserDashboardRepositoryInterface } from '@/dashboard/domain/repositories/user-dashboard.repository.interface';

@Injectable()
export class UserDashboardRepository
  implements UserDashboardRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findByUserId(userId: string): Promise<UserDashboard | null> {
    const row = await this.prisma.userDashboard.findUnique({
      where: { userId },
    });
    return row
      ? UserDashboard.reconstitute({
          id: row.id,
          userId: row.userId,
          layout: (row.layout as any[]) ?? [],
          createdAt: row.createdAt as any,
          updatedAt: row.updatedAt as any,
        })
      : null;
  }

  async upsertDefault(userId: string, defaultLayout: any[]): Promise<void> {
    await this.prisma.userDashboard.upsert({
      where: { userId },
      create: { userId, layout: defaultLayout as any },
      update: {},
    });
  }

  async upsert(userId: string, layout: any[]): Promise<void> {
    await this.prisma.userDashboard.upsert({
      where: { userId },
      create: { userId, layout: layout as any },
      update: { layout: layout as any },
    });
  }

  async save(entity: UserDashboard): Promise<void> {
    const data = entity.toPrimitives();
    await this.prisma.userDashboard.update({
      where: { id: data.id },
      data: { layout: data.layout as any },
    });
  }
}
