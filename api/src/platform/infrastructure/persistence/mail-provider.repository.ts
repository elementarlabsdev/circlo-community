import { Injectable } from '@nestjs/common';
import { MailProviderRepositoryInterface } from '@/platform/domain/repositories/mail-provider.repository.interface';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { MailProvider } from '@/platform/domain/entities/mail-provider.entity';

@Injectable()
export class MailProviderRepository implements MailProviderRepositoryInterface {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<MailProvider | null> {
    const providerDb = await this.prisma.mailProvider.findUnique({
      where: { id },
    });
    return providerDb ? MailProvider.reconstitute(providerDb as any) : null;
  }

  async findByType(type: string): Promise<MailProvider | null> {
    const providerDb = await this.prisma.mailProvider.findUnique({
      where: { type },
    });
    return providerDb ? MailProvider.reconstitute(providerDb as any) : null;
  }

  async findAll(): Promise<MailProvider[]> {
    const providersDb = await this.prisma.mailProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return providersDb.map((p) => MailProvider.reconstitute(p as any));
  }

  async create(provider: any): Promise<MailProvider> {
    const count = await this.prisma.mailProvider.count();
    const data = {
      name: provider.name,
      type: provider.type,
      position: provider.position ?? count + 1,
      description: provider.description ?? null,
      isEnabled: provider.isEnabled ?? false,
      isConfigured: provider.isConfigured ?? false,
      isDefault: provider.isDefault ?? false,
      config: provider.config ?? null,
    } as any;
    const created = await this.prisma.mailProvider.create({ data });
    return MailProvider.reconstitute(created as any);
  }

  async save(provider: MailProvider): Promise<void> {
    const data = provider.toPrimitives();
    await this.prisma.mailProvider.update({
      where: { id: data.id },
      data: {
        position: data.position,
        description: data.description,
        isEnabled: data.isEnabled,
        isConfigured: data.isConfigured,
        // if disabled, ensure not default
        isDefault: data.isEnabled === false ? false : data.isDefault,
        config: data.config,
      },
    });
  }
}
