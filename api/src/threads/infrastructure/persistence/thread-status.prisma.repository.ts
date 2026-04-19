import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ThreadStatusRepositoryInterface } from '../../domain/repositories/thread-status-repository.interface';
import { ThreadStatus } from '../../domain/entities/thread-status.entity';

@Injectable()
export class ThreadStatusPrismaRepository implements ThreadStatusRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  private map(row: any): ThreadStatus {
    return ThreadStatus.fromPersistence(row);
  }

  async findByIdOrFail(id: string): Promise<ThreadStatus> {
    const row = await this.prisma.threadStatus.findUniqueOrThrow({ where: { id } });
    return this.map(row);
    }

  async findByType(type: string): Promise<ThreadStatus | null> {
    const row = await this.prisma.threadStatus.findUnique({ where: { type } });
    return row ? this.map(row) : null;
  }

  async listAll(): Promise<ThreadStatus[]> {
    const rows = await this.prisma.threadStatus.findMany({ orderBy: { type: 'asc' } });
    return rows.map((r) => this.map(r));
  }
}
