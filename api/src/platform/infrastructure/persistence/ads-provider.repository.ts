import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { AdsProvider } from '@/platform/domain/entities/ads-provider.entity';
import { AdsProviderRepositoryInterface } from '@/platform/domain/repositories/ads-provider.repository.interface';

@Injectable()
export class AdsProviderRepository implements AdsProviderRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<AdsProvider | null> {
    const rec = await this.prisma.adsProvider.findUnique({ where: { id } });
    return rec ? AdsProvider.reconstitute(rec as any) : null;
  }

  async findByType(type: string): Promise<AdsProvider | null> {
    const rec = await this.prisma.adsProvider.findUnique({ where: { type } });
    return rec ? AdsProvider.reconstitute(rec as any) : null;
  }

  async findAll(): Promise<AdsProvider[]> {
    const rows = await this.prisma.adsProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return rows.map((r) => AdsProvider.reconstitute(r as any));
  }

  async create(provider: any): Promise<AdsProvider> {
    const count = await this.prisma.adsProvider.count();
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
    const created = await this.prisma.adsProvider.create({ data });
    return AdsProvider.reconstitute(created as any);
  }

  async save(provider: AdsProvider): Promise<void> {
    const data = provider.toPrimitives();
    await this.prisma.adsProvider.update({
      where: { id: data.id },
      data: {
        position: data.position,
        logoUrl: data.logoUrl,
        description: data.description,
        config: data.config,
        isConfigured: data.isConfigured,
        isEnabled: data.isEnabled,
      } as any,
    });
  }
}
