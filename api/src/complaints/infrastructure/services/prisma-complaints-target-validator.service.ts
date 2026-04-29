import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { ComplaintsTargetValidator } from '@/complaints/domain/services/complaints-target-validator.interface';

@Injectable()
export class PrismaComplaintsTargetValidator
  implements ComplaintsTargetValidator
{
  private readonly validators: Record<string, (id: string) => Promise<boolean>>;

  constructor(private readonly prisma: PrismaService) {
    this.validators = {
      comment: async (id: string) =>
        !!(await this.prisma.comment.findUnique({ where: { id } })),
      tutorial: async (id: string) =>
        !!(await this.prisma.tutorial.findUnique({ where: { id } })),
      publication: async (id: string) =>
        !!(await this.prisma.publication.findUnique({ where: { id } })),
      thread: async (id: string) =>
        !!(await this.prisma.thread.findUnique({ where: { id } })),
    };
  }

  supportedTypes(): string[] {
    return Object.keys(this.validators);
  }

  async validateExists(targetType: string, targetId: string): Promise<boolean> {
    const key = (targetType ?? '').toLowerCase();
    const validator = this.validators[key];
    if (!validator) return false;
    return validator(targetId);
  }
}
