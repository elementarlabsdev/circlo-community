import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ANALYTICS_PROVIDER_REPOSITORY, AnalyticsProviderRepositoryInterface } from '@/platform/domain/repositories/analytics-provider.repository.interface';

@Injectable()
export class UpdateAnalyticsProviderUseCase {
  constructor(
    @Inject(ANALYTICS_PROVIDER_REPOSITORY)
    private readonly repo: AnalyticsProviderRepositoryInterface,
  ) {}

  async execute(type: string, data: { isEnabled?: boolean; config?: any | null }): Promise<any> {
    const provider = await this.repo.findByType(type);
    if (!provider) throw new NotFoundException('Analytics provider not found');

    provider.update({
      isEnabled: typeof data.isEnabled === 'boolean' ? data.isEnabled : provider.isEnabled,
      config: data.config !== undefined ? data.config : provider.config,
      isConfigured: true,
    });

    await this.repo.save(provider);
    return provider.toPrimitives();
  }
}
