import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/platform/application/services/prisma.service';
import { FileStorageProvider } from '@/platform/domain/entities/file-storage-provider.entity';
import { FileStorageProviderRepositoryInterface } from '@/platform/domain/repositories/file-storage-provider.repository.interface';

@Injectable()
export class FileStorageProviderRepository
  implements FileStorageProviderRepositoryInterface
{
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<FileStorageProvider | null> {
    const rec = await this.prisma.fileStorageProvider.findUnique({
      where: { id },
    });
    return rec ? FileStorageProvider.reconstitute(rec as any) : null;
  }

  async findByType(type: string): Promise<FileStorageProvider | null> {
    const rec = await this.prisma.fileStorageProvider.findUnique({
      where: { type },
    });
    return rec ? FileStorageProvider.reconstitute(rec as any) : null;
  }

  async findAll(): Promise<FileStorageProvider[]> {
    const rows = await this.prisma.fileStorageProvider.findMany({
      orderBy: { position: 'asc' },
    });
    return rows.map((r) => FileStorageProvider.reconstitute(r as any));
  }

  async create(provider: any): Promise<FileStorageProvider> {
    const count = await this.prisma.fileStorageProvider.count();
    const data: any = {
      name: provider.name,
      type: provider.type,
      position: provider.position ?? count + 1,
      description: provider.description ?? null,
      accessKeyId: provider.accessKeyId ?? null,
      secretAccessKey: provider.secretAccessKey ?? null,
      region: provider.region ?? null,
      bucket: provider.bucket ?? null,
      useAcl: provider.useAcl ?? false,
      isConfigured: provider.isConfigured ?? false,
      isEnabled: provider.isEnabled ?? false,
      isDefault: provider.isDefault ?? false,
      cdnEnabled: provider.cdnEnabled ?? false,
    };
    const created = await this.prisma.fileStorageProvider.create({ data });
    return FileStorageProvider.reconstitute(created as any);
  }

  async save(provider: FileStorageProvider): Promise<void> {
    const data = provider.toPrimitives();
    await this.prisma.fileStorageProvider.update({
      where: { id: data.id },
      data: {
        position: data.position,
        description: data.description,
        accessKeyId: data.accessKeyId,
        secretAccessKey: data.secretAccessKey,
        region: data.region,
        bucket: data.bucket,
        useAcl: data.useAcl,
        isConfigured: data.isConfigured,
        isEnabled: data.isEnabled,
        // if disabled, ensure not default
        isDefault: data.isEnabled === false ? false : data.isDefault,
        cdnEnabled: data.cdnEnabled,
      },
    });
  }
}
