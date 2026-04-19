import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { AnalyticsProvider } from '@/platform/domain/entities/analytics-provider.entity';
import { AnalyticsProviderRepositoryInterface } from '@/platform/domain/repositories/analytics-provider.repository.interface';

@Injectable()
export class AnalyticsProviderRepository
  implements AnalyticsProviderRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AnalyticsProvider | null> {
    const rec = await this.prisma.analyticsProvider.findUnique({
      where: { id },
    });
    return rec ? AnalyticsProvider.reconstitute(rec as any) : null;
  }

  async findByType(type: string): Promise<AnalyticsProvider | null> {
    const rec = await this.prisma.analyticsProvider.findUnique({
      where: { type },
    });
    return rec ? AnalyticsProvider.reconstitute(rec as any) : null;
  }

  async findAll(): Promise<AnalyticsProvider[]> {
    const rows = await this.prisma.analyticsProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return rows.map((r) => AnalyticsProvider.reconstitute(r as any));
  }

  async create(provider: any): Promise<AnalyticsProvider> {
    const count = await this.prisma.analyticsProvider.count();
    const data: any = {
      name: provider.name,
      type: provider.type,
      position: provider.position ?? count + 1,
      logoUrl: provider.logoUrl ?? null,
      description: provider.description ?? null,
      config: provider.config ?? null,
      isConfigured: provider.isConfigured ?? false,
      isEnabled: provider.isEnabled ?? false,
    };
    const created = await this.prisma.analyticsProvider.create({ data });
    return AnalyticsProvider.reconstitute(created as any);
  }

  async save(provider: AnalyticsProvider): Promise<void> {
    const data = provider.toPrimitives();
    await this.prisma.analyticsProvider.update({
      where: { id: data.id },
      data: {
        position: data.position,
        logoUrl: data.logoUrl,
        description: data.description,
        config: data.config,
        isConfigured: data.isConfigured,
        isEnabled: data.isEnabled,
      },
    });
  }
}
