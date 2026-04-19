import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';

@Injectable()
export class SetDefaultAnalyticsProviderUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(type: string): Promise<void> {
    // No-op: Analytics providers do not have a concept of "default" in the current schema.
    // This use-case remains for backward compatibility, but intentionally does nothing.
    // Use updateAnalyticsProvider to enable/disable specific providers instead.
    return;
  }
}
