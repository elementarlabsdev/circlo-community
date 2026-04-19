import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { Complaint } from '@/complaints/domain/entities/complaint.entity';
import {
  ComplaintListParams,
  ComplaintRepository,
} from '@/complaints/domain/repositories/complaint.repository.interface';

@Injectable()
export class PrismaComplaintRepository implements ComplaintRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toDomain(row: any): Complaint {
    return Complaint.fromPrimitives({
      id: row.id,
      name: row.name,
      targetType: row.targetType,
      targetId: row.targetId,
      reporterId: row.reporterId ?? null,
      reporterIp: row.reporterIp ?? null,
      reportedUrl: row.reportedUrl ?? null,
      reason: row.reason?.code,
      status: row.status?.code,
      details: row.details ?? null,
      attachmentIds: Array.isArray(row.attachments)
        ? row.attachments.map((f: any) => f.id)
        : [],
      internalNotes: Array.isArray(row.internalNotes)
        ? row.internalNotes.map((n: any) => ({
            id: n.id,
            complaintId: n.complaintId,
            type: n.type,
            content: n.content,
            createdAt: n.createdAt,
            updatedAt: n.updatedAt,
          }))
        : [],
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }

  async create(entity: Complaint): Promise<Complaint> {
    const p = entity.toPrimitives();
    const created = await this.prisma.complaint.create({
      data: {
        name: p.name ?? undefined,
        targetType: p.targetType,
        targetId: p.targetId,
        reporterIp: p.reporterIp ?? undefined,
        ...(p.reporterId ? { reporter: { connect: { id: p.reporterId } } } : {}),
        reason: { connect: { code: p.reason } },
        status: { connect: { code: p.status } },
        details: p.details ?? undefined,
        reportedUrl: p.reportedUrl ?? undefined,
        ...(p.attachmentIds?.length
          ? { attachments: { connect: p.attachmentIds.map((id) => ({ id })) } }
          : {}),
      },
      include: {
        attachments: { select: { id: true } },
        reason: { select: { code: true } },
        status: { select: { code: true } },
        internalNotes: true,
      },
    });
    return this.toDomain(created);
  }

  async findById(id: string): Promise<Complaint | null> {
    const found = await this.prisma.complaint.findUnique({
      where: { id },
      include: {
        attachments: { select: { id: true } },
        reason: { select: { code: true } },
        status: { select: { code: true } },
        internalNotes: true,
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async findMany(params: ComplaintListParams): Promise<Complaint[]> {
    const { skip = 0, take = 20, targetType, reason } = params;
    const rows = await this.prisma.complaint.findMany({
      where: {
        ...(targetType ? { targetType: targetType.toLowerCase() } : {}),
        ...(reason ? { reason: { code: reason } } : {}),
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        attachments: { select: { id: true } },
        reason: { select: { code: true } },
        status: { select: { code: true } },
        internalNotes: true,
      },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async existsByReporterAndTarget(
    reporterId: string,
    targetType: string,
    targetId: string,
  ): Promise<boolean> {
    const found = await this.prisma.complaint.findFirst({
      where: { reporterId, targetType: targetType.toLowerCase(), targetId },
      select: { id: true },
    });
    return !!found;
  }

  async findAnonymousDuplicate(
    targetType: string,
    targetId: string,
    reporterIp: string,
  ): Promise<Complaint | null> {
    const found = await this.prisma.complaint.findFirst({
      where: {
        reporterId: null,
        reporterIp,
        targetType: targetType.toLowerCase(),
        targetId,
      },
      include: {
        attachments: { select: { id: true } },
        reason: { select: { code: true } },
        status: { select: { code: true } },
        internalNotes: true,
      },
    });
    return found ? this.toDomain(found) : null;
  }

  async delete(id: string): Promise<void> {
    await this.prisma.complaint.delete({
      where: { id },
    });
  }
}
