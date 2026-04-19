import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  FILE_STORAGE_PROVIDER_REPOSITORY,
  FileStorageProviderRepositoryInterface,
} from '@/platform/domain/repositories/file-storage-provider.repository.interface';

@Injectable()
export class UpdateFileStorageProviderUseCase {
  constructor(
    @Inject(FILE_STORAGE_PROVIDER_REPOSITORY)
    private readonly repo: FileStorageProviderRepositoryInterface,
  ) {}

  async execute(
    type: string,
    data: {
      isEnabled?: boolean;
      endpoint?: string | null;
      publicUrl?: string | null;
      accessKeyId?: string | null;
      secretAccessKey?: string | null;
      region?: string | null;
      bucket?: string | null;
      useAcl?: boolean;
      cdnEnabled?: boolean;
    },
  ): Promise<any> {
    const provider = await this.repo.findByType(type);

    if (!provider) {
      throw new NotFoundException('File storage provider not found');
    }

    provider.update({
      isEnabled:
        typeof data.isEnabled === 'boolean'
          ? data.isEnabled
          : provider.isEnabled,
      accessKeyId:
        data.accessKeyId !== undefined ? data.accessKeyId : provider.accessKeyId,
      secretAccessKey:
        data.secretAccessKey !== undefined
          ? data.secretAccessKey
          : provider.secretAccessKey,
      region: data.region !== undefined ? data.region : provider.region,
      bucket: data.bucket !== undefined ? data.bucket : provider.bucket,
      useAcl: typeof data.useAcl === 'boolean' ? data.useAcl : provider.useAcl,
      cdnEnabled:
        typeof data.cdnEnabled === 'boolean'
          ? data.cdnEnabled
          : provider.cdnEnabled,
      isConfigured: true,
    });

    await this.repo.save(provider);
    return provider.toPrimitives();
  }
}
