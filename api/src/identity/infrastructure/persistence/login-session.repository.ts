import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { LoginSession } from '@/identity/domain/entities/login-session.entity';
import { LoginSessionRepositoryInterface } from '@/identity/domain/repositories/login-session-repository.interface';

@Injectable()
export class LoginSessionRepository implements LoginSessionRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async create(session: LoginSession): Promise<void> {
    const data = session.toPrimitives();
    await this.prisma.loginSession.create({
      data: {
        id: data.id,
        userId: data.userId,
        device: data.device,
        userAgent: data.userAgent ?? undefined,
        ipAddress: data.ipAddress,
        location: data.location ?? undefined,
        createdAt: data.createdAt,
        lastActivityAt: data.lastActivityAt ?? undefined,
        isCurrent: data.isCurrent,
        expiresAt: data.expiresAt ?? undefined,
        revokedAt: data.revokedAt ?? undefined,
        metadata: (data.metadata as any) ?? undefined,
      },
    });
  }

  async findById(id: string): Promise<LoginSession | null> {
    const rec = await this.prisma.loginSession.findUnique({ where: { id } });
    return rec ? this.mapToDomain(rec) : null;
  }

  async findByUser(userId: string): Promise<LoginSession[]> {
    const recs = await this.prisma.loginSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return recs.map((r) => this.mapToDomain(r));
  }

  async revokeById(id: string): Promise<void> {
    await this.prisma.loginSession.update({
      where: { id },
      data: { revokedAt: new Date(), isCurrent: false },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.prisma.loginSession.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date(), isCurrent: false },
    });
  }

  async revokeAllExcept(userId: string, sessionId: string): Promise<void> {
    await this.prisma.loginSession.updateMany({
      where: { userId, id: { not: sessionId }, revokedAt: null },
      data: { revokedAt: new Date(), isCurrent: false },
    });
  }

  async touchActivity(id: string, at: Date = new Date()): Promise<void> {
    await this.prisma.loginSession.update({
      where: { id },
      data: { lastActivityAt: at },
    });
  }

  async markCurrent(id: string): Promise<void> {
    await this.prisma.loginSession.update({
      where: { id },
      data: { isCurrent: true },
    });
  }

  async deleteExpired(before: Date): Promise<number> {
    const res = await this.prisma.loginSession.deleteMany({
      where: {
        OR: [
          { expiresAt: { lte: before } },
          { revokedAt: { lte: before } },
        ],
      },
    });
    return res.count;
  }

  private mapToDomain(rec: any): LoginSession {
    return LoginSession.reconstitute({
      id: rec.id,
      userId: rec.userId,
      device: rec.device,
      userAgent: rec.userAgent ?? null,
      ipAddress: rec.ipAddress,
      location: rec.location ?? null,
      createdAt: rec.createdAt,
      lastActivityAt: rec.lastActivityAt ?? null,
      isCurrent: rec.isCurrent,
      expiresAt: rec.expiresAt ?? null,
      revokedAt: rec.revokedAt ?? null,
      metadata: rec.metadata ?? null,
    });
  }
}
