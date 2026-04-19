import { FileStorageProvider } from '@/platform/domain/entities/file-storage-provider.entity';

export const FILE_STORAGE_PROVIDER_REPOSITORY = 'FileStorageProviderRepository';

export interface FileStorageProviderRepositoryInterface {
  findById(id: string): Promise<FileStorageProvider | null>;
  findByType(type: string): Promise<FileStorageProvider | null>;
  findAll(): Promise<FileStorageProvider[]>;
  create(provider: any): Promise<FileStorageProvider>;
  save(provider: FileStorageProvider): Promise<void>;
}
