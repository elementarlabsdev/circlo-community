import { AdsProvider } from '@/platform/domain/entities/ads-provider.entity';

export const ADS_PROVIDER_REPOSITORY = 'AdsProviderRepository';

export interface AdsProviderRepositoryInterface {
  findById(id: string): Promise<AdsProvider | null>;
  findByType(type: string): Promise<AdsProvider | null>;
  findAll(): Promise<AdsProvider[]>;
  create(provider: any): Promise<AdsProvider>;
  save(provider: AdsProvider): Promise<void>;
}
