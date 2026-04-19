import { Inject, Injectable } from '@nestjs/common';
import { FILE_STORAGE_PROVIDER_REPOSITORY, FileStorageProviderRepositoryInterface } from '@/platform/domain/repositories/file-storage-provider.repository.interface';

@Injectable()
export class GetAllFileStorageProvidersUseCase {
  constructor(
    @Inject(FILE_STORAGE_PROVIDER_REPOSITORY)
    private readonly repo: FileStorageProviderRepositoryInterface,
  ) {}

  async execute() {
    const providers = await this.repo.findAll();
    return providers.map(p => p.toPrimitives());
  }
}
