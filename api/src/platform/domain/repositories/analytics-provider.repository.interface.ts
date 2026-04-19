import { AnalyticsProvider } from '@/platform/domain/entities/analytics-provider.entity';

export const ANALYTICS_PROVIDER_REPOSITORY = 'AnalyticsProviderRepository';

export interface AnalyticsProviderRepositoryInterface {
  findById(id: string): Promise<AnalyticsProvider | null>;
  findByType(type: string): Promise<AnalyticsProvider | null>;
  findAll(): Promise<AnalyticsProvider[]>;
  create(provider: any): Promise<AnalyticsProvider>;
  save(provider: AnalyticsProvider): Promise<void>;
}
